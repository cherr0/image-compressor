#!/usr/bin/env node

import { ImageCompressor } from './index.js';
import inquirer from 'inquirer';
import chalk from 'chalk';

async function runInteractiveMode() {
  console.log(chalk.blue('=== 이미지 압축 도구 - 대화형 모드 ===\n'));
  
  const compressor = new ImageCompressor();
  
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'input',
      message: '입력 폴더 경로를 입력하세요:',
      default: './images',
      validate: (value) => {
        if (!value.trim()) {
          return '입력 폴더 경로를 입력해주세요.';
        }
        return true;
      }
    },
    {
      type: 'input',
      name: 'output',
      message: '출력 폴더 경로를 입력하세요:',
      default: './compressed',
      validate: (value) => {
        if (!value.trim()) {
          return '출력 폴더 경로를 입력해주세요.';
        }
        return true;
      }
    },
    {
      type: 'number',
      name: 'quality',
      message: '압축 품질을 입력하세요 (1-100):',
      default: 80,
      validate: (value) => {
        if (value < 1 || value > 100) {
          return '1-100 사이의 값을 입력하세요.';
        }
        return true;
      }
    },
    {
      type: 'list',
      name: 'format',
      message: '출력 포맷을 선택하세요:',
              choices: [
          { name: '자동 (원본 포맷 유지)', value: 'auto' },
          { name: 'JPEG', value: 'jpg' },
          { name: 'PNG', value: 'png' },
          { name: 'WebP', value: 'webp' }
        ]
    },
    {
      type: 'confirm',
      name: 'removeMetadata',
      message: '메타데이터를 제거하시겠습니까?',
      default: false
    },
    {
      type: 'number',
      name: 'width',
      message: '최대 너비를 입력하세요 (픽셀, 생략 가능):',
      default: null,
      validate: (value) => {
        if (value && (value < 1 || value > 10000)) {
          return '1-10000 사이의 값을 입력하세요.';
        }
        return true;
      }
    },
    {
      type: 'number',
      name: 'height',
      message: '최대 높이를 입력하세요 (픽셀, 생략 가능):',
      default: null,
      validate: (value) => {
        if (value && (value < 1 || value > 10000)) {
          return '1-10000 사이의 값을 입력하세요.';
        }
        return true;
      }
    }
  ]);

  const options = {
    quality: answers.quality,
    format: answers.format,
    removeMetadata: answers.removeMetadata,
    width: answers.width || undefined,
    height: answers.height || undefined
  };

  console.log(chalk.blue('\n=== 설정 확인 ==='));
  console.log(chalk.gray(`입력 폴더: ${answers.input}`));
  console.log(chalk.gray(`출력 폴더: ${answers.output}`));
  console.log(chalk.gray(`품질: ${answers.quality}%`));
  console.log(chalk.gray(`포맷: ${answers.format}`));
  console.log(chalk.gray(`메타데이터 제거: ${answers.removeMetadata ? '예' : '아니오'}`));
  if (answers.width || answers.height) {
    console.log(chalk.gray(`크기 조정: ${answers.width || '자동'} x ${answers.height || '자동'}`));
  }
  console.log('');

  const confirm = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'proceed',
      message: '이 설정으로 압축을 시작하시겠습니까?',
      default: true
    }
  ]);

  if (confirm.proceed) {
    console.log(chalk.blue('이미지 압축을 시작합니다...'));
    await compressor.processBatch(answers.input, answers.output, options);
  } else {
    console.log(chalk.yellow('압축이 취소되었습니다.'));
  }
}

// 스크립트 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  runInteractiveMode().catch(error => {
    console.error(chalk.red('오류가 발생했습니다:'), error.message);
    process.exit(1);
  });
} 