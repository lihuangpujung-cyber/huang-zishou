#!/usr/bin/env node
/**
 * 低负载渲染入口（本地备选通道）
 *
 * 用法：
 *   node scripts/render-low.mjs <CompositionId> <输出路径> [--frames=0-89] [--full] [--priority=idle|below|normal]
 *
 * 设计目标：在必须本地渲染时，把对用户日常使用的影响降到最低。
 *   1. --concurrency=1（正式 2）     —— 只开 1 个浏览器标签
 *   2. 测试默认 --scale=0.5          —— 只光栅化 1/4 像素
 *   3. --priority=idle（默认）        —— 把渲染进程降到 Windows「空闲」优先级，
 *      子进程（Edge）继承同一优先级，用户前台操作永远抢得到 CPU
 *   4. --full                         —— 1080x1920 正式渲染
 */
import {spawn, spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const args = process.argv.slice(2);
const compId = args[0];
const outPath = args[1];
if (!compId || !outPath) {
  console.error(
    '用法: node scripts/render-low.mjs <CompositionId> <输出路径> [--frames=a-b] [--full] [--priority=idle|below|normal]',
  );
  process.exit(1);
}

const isFull = args.includes('--full');
const priorityArg = args.find((a) => a.startsWith('--priority='));
const priority = priorityArg ? priorityArg.split('=')[1] : 'idle';
const framesArg = args.find((a) => a.startsWith('--frames='));
const passThrough = args
  .slice(2)
  .filter((a) => !a.startsWith('--frames=') && !a.startsWith('--priority=') && a !== '--full');

const cwd = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cli = path.join(cwd, 'node_modules', '@remotion', 'cli', 'remotion-cli.js');

const flags = [
  'render',
  'src/index.ts',
  compId,
  outPath,
  `--concurrency=${isFull ? 2 : 1}`,
  isFull ? '--scale=1' : '--scale=0.5',
  '--log=info',
];
if (framesArg) flags.push(framesArg);
flags.push(...passThrough);

const absOut = path.resolve(cwd, outPath);
if (!fs.existsSync(path.dirname(absOut))) {
  fs.mkdirSync(path.dirname(absOut), {recursive: true});
}

console.log(`[低负载渲染] ${compId} -> ${outPath}`);
console.log(
  `[低负载渲染] 并发=${isFull ? 2 : 1}  缩放=${isFull ? 1 : 0.5}  优先级=${priority}  ${framesArg ?? '全部帧'}`,
);

const child = spawn(process.execPath, [cli, ...flags], {cwd, stdio: 'inherit'});

/**
 * 降优先级：Windows 上通过 PowerShell 设置 PriorityClass，
 * 子进程（msedge.exe）会继承该优先级，从而让浏览器标签也跑在空闲级。
 * 失败不影响渲染，只打警告（PowerShell 被策略限制时可能失败）。
 */
if (process.platform === 'win32' && priority !== 'normal') {
  const cls = priority === 'idle' ? 'Idle' : 'BelowNormal';
  const ps = `for ($i=0; $i -lt 20; $i++) { try { $p = Get-Process -Id ${child.pid} -ErrorAction Stop; $p.PriorityClass = '${cls}'; Write-Output 'ok'; break } catch { Start-Sleep -Milliseconds 150 } }`;
  const r = spawnSync('powershell', ['-NoProfile', '-NonInteractive', '-Command', ps], {
    encoding: 'utf8',
    timeout: 15000,
  });
  if ((r.stdout || '').includes('ok')) {
    console.log(`[低负载渲染] 已把渲染进程降到 ${cls} 优先级（Edge 子进程继承）`);
  } else {
    console.warn('[低负载渲染] 降优先级未生效，继续以默认优先级渲染');
  }
}

child.on('exit', (code) => process.exit(code ?? 1));
