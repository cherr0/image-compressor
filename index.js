#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';
import sharp from 'sharp';
import imagemin from 'imagemin';
import imageminMozjpeg from 'imagemin-mozjpeg';
import imageminPngquant from 'imagemin-pngquant';
import imageminWebp from 'imagemin-webp';

import { Command } from 'commander';
import ora from 'ora';
import chalk from 'chalk';
import inquirer from 'inquirer';

export class ImageCompressor {
  constructor() {
    this.supportedFormats = ['.jpg', '.jpeg', '.png', '.webp'];
    this.stats = {
      processed: 0,
      skipped: 0,
      errors: 0,
      totalSaved: 0
    };
  }

  // 지원되는 이미지 파일인지 확인
  isImageFile(filename) {
    const ext = path.extname(filename).toLowerCase();
    return this.supportedFormats.includes(ext);
  }

  // 파일 크기 계산 (MB)
  getFileSize(filePath) {
    const stats = fs.statSync(filePath);
    return (stats.size / 1024 / 1024).toFixed(2);
  }

  // 압축 옵션 설정
  getCompressionOptions(options) {
    const config = {
      quality: options.quality || 80,
      width: options.width,
      height: options.height,
      format: options.format || 'auto',
      removeMetadata: options.removeMetadata || false
    };

    return config;
  }

  // Sharp를 사용한 이미지 처리
  async processWithSharp(inputPath, outputPath, options) {
    try {
      let pipeline = sharp(inputPath);

      // 리사이징
      if (options.width || options.height) {
        pipeline = pipeline.resize(options.width, options.height, {
          fit: 'inside',
          withoutEnlargement: true
        });
      }

      // 메타데이터 제거
      if (options.removeMetadata) {
        pipeline = pipeline.withMetadata(false);
      }

      // 포맷별 처리
      const ext = path.extname(inputPath).toLowerCase();
      const outputExt = path.extname(outputPath).toLowerCase();

      if (outputExt === '.webp') {
        pipeline = pipeline.webp({ quality: options.quality });
      } else if (['.jpg', '.jpeg'].includes(outputExt)) {
        pipeline = pipeline.jpeg({ quality: options.quality, mozjpeg: true });
      } else if (outputExt === '.png') {
        pipeline = pipeline.png({ quality: options.quality });
      } else {
        // 원본 포맷 유지하면서 압축
        if (['.jpg', '.jpeg'].includes(ext)) {
          pipeline = pipeline.jpeg({ quality: options.quality, mozjpeg: true });
        } else if (ext === '.png') {
          pipeline = pipeline.png({ quality: options.quality });
        }
      }

      await pipeline.toFile(outputPath);
      return true;
    } catch (error) {
      console.error(chalk.red(`Sharp 처리 오류: ${inputPath}`), error.message);
      return false;
    }
  }

  // Imagemin을 사용한 추가 최적화
  async optimizeWithImagemin(filePath, options) {
    try {
      const plugins = [];

      const ext = path.extname(filePath).toLowerCase();
      
      if (['.jpg', '.jpeg'].includes(ext)) {
        plugins.push(imageminMozjpeg({ quality: options.quality }));
      } else if (ext === '.png') {
        plugins.push(imageminPngquant({ quality: [0.6, 0.8] }));
      } else if (ext === '.webp') {
        plugins.push(imageminWebp({ quality: options.quality }));
      }

      if (plugins.length > 0) {
        const files = await imagemin([filePath], {
          plugins: plugins
        });

        if (files.length > 0) {
          await fs.writeFile(filePath, files[0].data);
        }
      }

      return true;
    } catch (error) {
      console.error(chalk.red(`Imagemin 최적화 오류: ${filePath}`), error.message);
      return false;
    }
  }

  // 단일 파일 처리
  async processFile(inputPath, outputPath, options) {
    const originalSize = this.getFileSize(inputPath);
    
    // Sharp로 기본 처리
    const sharpSuccess = await this.processWithSharp(inputPath, outputPath, options);
    if (!sharpSuccess) return false;

    // Imagemin으로 추가 최적화
    await this.optimizeWithImagemin(outputPath, options);

    const compressedSize = this.getFileSize(outputPath);
    const savedSize = parseFloat(originalSize) - parseFloat(compressedSize);
    
    this.stats.totalSaved += savedSize;

    console.log(chalk.green(`✓ ${path.basename(inputPath)}`));
    console.log(chalk.gray(`  ${originalSize}MB → ${compressedSize}MB (${savedSize.toFixed(2)}MB 절약)`));

    return true;
  }

  // 배치 처리
  async processBatch(inputDir, outputDir, options) {
    const spinner = ora('이미지 파일 검색 중...').start();

    try {
      // 이미지 파일 찾기
      const absoluteInputDir = path.resolve(inputDir);
      const pattern = path.join(absoluteInputDir, '**', '*');
      
      const files = await glob(pattern, { 
        nodir: true,
        windowsPathsNoEscape: true,
        ignore: ['node_modules/**']
      });
      
      const imageFiles = files.filter(file => this.isImageFile(file));

      spinner.succeed(`${imageFiles.length}개의 이미지 파일을 찾았습니다.`);

      if (imageFiles.length === 0) {
        console.log(chalk.yellow('처리할 이미지 파일이 없습니다.'));
        return;
      }

      // 출력 디렉토리 생성
      await fs.ensureDir(outputDir);

      // 파일 처리
      const processSpinner = ora('이미지 압축 중...').start();

      for (const file of imageFiles) {
        const relativePath = path.relative(inputDir, file);
        const outputPath = path.join(outputDir, relativePath);
        
        // 출력 디렉토리 생성
        await fs.ensureDir(path.dirname(outputPath));

        const success = await this.processFile(file, outputPath, options);
        
        if (success) {
          this.stats.processed++;
        } else {
          this.stats.errors++;
        }
      }

      processSpinner.succeed('압축 완료!');

      // 결과 출력
      this.printStats();

    } catch (error) {
      spinner.fail('처리 중 오류가 발생했습니다.');
      console.error(chalk.red(error.message));
    }
  }

  // 통계 출력
  printStats() {
    console.log('\n' + chalk.blue('=== 처리 결과 ==='));
    console.log(chalk.green(`처리된 파일: ${this.stats.processed}개`));
    console.log(chalk.yellow(`오류 발생: ${this.stats.errors}개`));
    console.log(chalk.cyan(`총 절약된 용량: ${this.stats.totalSaved.toFixed(2)}MB`));
  }
}

// CLI 설정
const program = new Command();

program
  .name('image-compressor')
  .description('이미지 일괄 압축 및 경량화 도구')
  .version('1.0.0');

program
  .command('compress')
  .description('이미지 압축 실행')
  .argument('<input>', '입력 폴더 경로')
  .option('-o, --output <path>', '출력 폴더 경로', './compressed')
  .option('-q, --quality <number>', '압축 품질 (1-100)', '80')
  .option('-w, --width <number>', '최대 너비 (픽셀)')
  .option('-h, --height <number>', '최대 높이 (픽셀)')
  .option('-f, --format <format>', '출력 포맷 (auto/jpg/png/webp)', 'auto')
  .option('--remove-metadata', '메타데이터 제거')
  .action(async (input, options) => {
    const compressor = new ImageCompressor();
    const compressionOptions = compressor.getCompressionOptions(options);
    
    console.log(chalk.blue('이미지 압축을 시작합니다...'));
    console.log(chalk.gray(`입력: ${input}`));
    console.log(chalk.gray(`출력: ${options.output}`));
    console.log(chalk.gray(`품질: ${compressionOptions.quality}%`));
    
    await compressor.processBatch(input, options.output, compressionOptions);
  });

// 기본 명령어 (인수 없이 실행 시)
program
  .command('auto')
  .description('기본값으로 자동 압축 실행')
  .action(async () => {
    const compressor = new ImageCompressor();
    const defaultOptions = {
      quality: 80,
      format: 'auto',
      removeMetadata: false
    };
    
    console.log(chalk.blue('기본 설정으로 이미지 압축을 시작합니다...'));
    console.log(chalk.gray('입력: ./images'));
    console.log(chalk.gray('출력: ./compressed'));
    console.log(chalk.gray('품질: 80%'));
    console.log(chalk.gray('포맷: 자동'));
    
    await compressor.processBatch('./images', './compressed', defaultOptions);
  });



// 기본 명령어 실행 (인수 없이 실행 시)
if (process.argv.length === 2) {
  console.log(chalk.blue('기본 설정으로 이미지 압축을 시작합니다...'));
  console.log(chalk.gray('입력: ./images'));
  console.log(chalk.gray('출력: ./compressed'));
  console.log(chalk.gray('품질: 80%'));
  console.log(chalk.gray('포맷: 자동'));
  console.log(chalk.gray('메타데이터: 유지'));
  console.log('');
  
  const compressor = new ImageCompressor();
  const defaultOptions = {
    quality: 80,
    format: 'auto',
    removeMetadata: false
  };
  
  await compressor.processBatch('./images', './compressed', defaultOptions);
}

program.parse(); 