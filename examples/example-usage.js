#!/usr/bin/env node

import { ImageCompressor } from '../index.js';
import path from 'path';

// 사용 예제들
const examples = {
  // 1. 기본 압축
  basicCompression: async () => {
    console.log('=== 기본 압축 예제 ===');
    const compressor = new ImageCompressor();
    await compressor.processBatch('./examples/images', './examples/output/basic', {
      quality: 80,
      format: 'auto'
    });
  },

  // 2. WebP 변환
  webpConversion: async () => {
    console.log('=== WebP 변환 예제 ===');
    const compressor = new ImageCompressor();
    await compressor.processBatch('./examples/images', './examples/output/webp', {
      quality: 85,
      format: 'webp'
    });
  },

  // 3. 크기 조정
  resizeImages: async () => {
    console.log('=== 크기 조정 예제 ===');
    const compressor = new ImageCompressor();
    await compressor.processBatch('./examples/images', './examples/output/resized', {
      quality: 80,
      width: 1200,
      height: 800
    });
  },

  // 4. 고품질 압축
  highQuality: async () => {
    console.log('=== 고품질 압축 예제 ===');
    const compressor = new ImageCompressor();
    await compressor.processBatch('./examples/images', './examples/output/high-quality', {
      quality: 95,
      format: 'auto'
    });
  },

  // 5. 메타데이터 제거
  removeMetadata: async () => {
    console.log('=== 메타데이터 제거 예제 ===');
    const compressor = new ImageCompressor();
    await compressor.processBatch('./examples/images', './examples/output/no-metadata', {
      quality: 80,
      removeMetadata: true
    });
  },


};

// 특정 예제 실행
async function runExample(exampleName) {
  if (examples[exampleName]) {
    await examples[exampleName]();
  } else {
    console.log('사용 가능한 예제들:');
    Object.keys(examples).forEach(name => {
      console.log(`- ${name}`);
    });
  }
}

// 모든 예제 실행
async function runAllExamples() {
  console.log('모든 예제를 실행합니다...\n');
  
  for (const [name, example] of Object.entries(examples)) {
    try {
      await example();
      console.log('\n');
    } catch (error) {
      console.error(`${name} 예제 실행 중 오류:`, error.message);
    }
  }
  
  console.log('모든 예제 실행 완료!');
}

// 명령행 인수 처리
const args = process.argv.slice(2);
if (args.length > 0) {
  runExample(args[0]);
} else {
  runAllExamples();
} 