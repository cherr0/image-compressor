#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

async function setupProject() {
  console.log(chalk.blue('프로젝트 초기 설정을 시작합니다...'));
  
  try {
    // 기본 폴더들 생성
    const folders = [
      './images',
      './compressed',
      './examples/images',
      './examples/output'
    ];
    
    for (const folder of folders) {
      await fs.ensureDir(folder);
      console.log(chalk.green(`✓ ${folder} 폴더 생성 완료`));
    }
    
    console.log(chalk.blue('\n=== 설정 완료 ==='));
    console.log(chalk.gray('이제 ./images 폴더에 압축할 이미지를 넣고 다음 명령어를 실행하세요:'));
    console.log(chalk.yellow('npm start'));
    console.log(chalk.gray('또는'));
    console.log(chalk.yellow('npm run auto'));
    
  } catch (error) {
    console.error(chalk.red('설정 중 오류가 발생했습니다:'), error.message);
  }
}

// 스크립트 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  setupProject();
} 