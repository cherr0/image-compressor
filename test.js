#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import { ImageCompressor } from './index.js';

// 테스트용 이미지 폴더 생성
const testDir = './test-images';
const outputDir = './test-output';

async function createTestImages() {
  console.log('테스트 이미지 생성 중...');
  
  // 테스트 폴더 생성
  await fs.ensureDir(testDir);
  await fs.ensureDir(outputDir);
  
  // 간단한 테스트 이미지 생성 (Sharp 사용)
  const sharp = (await import('sharp')).default;
  
  // 1. JPEG 테스트 이미지
  await sharp({
    create: {
      width: 800,
      height: 600,
      channels: 3,
      background: { r: 255, g: 100, b: 100 }
    }
  })
  .jpeg({ quality: 90 })
  .toFile(path.join(testDir, 'test1.jpg'));
  
  // 2. PNG 테스트 이미지
  await sharp({
    create: {
      width: 600,
      height: 400,
      channels: 4,
      background: { r: 100, g: 200, b: 255, alpha: 1 }
    }
  })
  .png()
  .toFile(path.join(testDir, 'test2.png'));
  
  // 3. WebP 테스트 이미지
  await sharp({
    create: {
      width: 400,
      height: 300,
      channels: 3,
      background: { r: 255, g: 255, b: 100 }
    }
  })
  .webp({ quality: 85 })
  .toFile(path.join(testDir, 'test3.webp'));
  
  console.log('테스트 이미지 생성 완료!');
}

async function runTests() {
  console.log('=== 이미지 압축 도구 테스트 ===\n');
  
  try {
    // 1. 테스트 이미지 생성
    await createTestImages();
    
    // 2. 기본 압축 테스트
    console.log('\n1. 기본 압축 테스트...');
    const compressor = new ImageCompressor();
    await compressor.processBatch(testDir, path.join(outputDir, 'basic'), {
      quality: 80,
      format: 'auto'
    });
    
    // 3. WebP 변환 테스트
    console.log('\n2. WebP 변환 테스트...');
    await compressor.processBatch(testDir, path.join(outputDir, 'webp'), {
      quality: 85,
      format: 'webp'
    });
    
    // 4. 크기 조정 테스트
    console.log('\n3. 크기 조정 테스트...');
    await compressor.processBatch(testDir, path.join(outputDir, 'resized'), {
      quality: 80,
      width: 400,
      height: 300
    });
    
    // 5. 메타데이터 제거 테스트
    console.log('\n4. 메타데이터 제거 테스트...');
    await compressor.processBatch(testDir, path.join(outputDir, 'no-metadata'), {
      quality: 80,
      removeMetadata: true
    });
    
    console.log('\n=== 모든 테스트 완료! ===');
    console.log(`테스트 이미지: ${testDir}`);
    console.log(`결과 폴더: ${outputDir}`);
    
  } catch (error) {
    console.error('테스트 중 오류 발생:', error.message);
  }
}

// 테스트 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests();
} 