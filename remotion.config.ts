import {existsSync} from 'node:fs';
import {Config} from '@remotion/cli/config';

/**
 * 低负载渲染配置（本项目统一使用）
 * 目的：在保证画面可用的前提下，尽量降低 CPU 占用与内存峰值。
 *
 * 关键取舍：
 * - concurrency = 2：本机 16 核，Remotion 默认会开 8 个浏览器标签并行，
 *   每个标签一整屏 1080x1920 光栅化，CPU 会被打满。降到 2 后峰值明显下降。
 * - 图片中间格式用 jpeg(85)：比 png 少一次无损压缩/解码，帧管道更轻。
 * - x264 veryfast + crf 26：编码速度快、体积可控，人眼几乎无差。
 * - 帧率保持 30fps（交付要求），但测试一律 --scale=0.5 只渲染 1/4 像素量。
 */
Config.setConcurrency(2);
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(85);
Config.setCodec('h264');
Config.setCrf(26);
Config.setX264Preset('veryfast');
Config.setPixelFormat('yuv420p');
Config.setOverwriteOutput(true);
Config.setDelayRenderTimeoutInMilliseconds(120000);

/**
 * 浏览器选择（分平台处理，否则云端 Linux runner 会因路径不存在而失败）：
 * - Windows 本机：复用已安装的 Edge，避免下载 150MB 的 Chrome Headless Shell。
 * - GitHub Actions（Linux）：路径不存在，交给 Remotion 自行使用 runner 上的浏览器。
 */
const LOCAL_EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
if (process.platform === 'win32' && existsSync(LOCAL_EDGE)) {
  Config.setBrowserExecutable(LOCAL_EDGE);
}


