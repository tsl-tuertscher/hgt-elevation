import * as fs from 'fs-extra';

export class Hgt {
  private config: HgtInterface;

  private data: any;
  private acitveFile: string = '';

  constructor(config: HgtInterface) {
    this.config = config;
  }

  public async getElevationFromCoordinate(point: number[]): Promise<number> {
    let xPath = 0;
    let yPath = 0;

    if (point[1] < 0) {
      yPath = Math.floor(((90 + point[1]) * this.config.tessellation) / 180);
    } else {
      yPath = Math.floor(((90 + point[1]) * this.config.tessellation) / 180);
    }

    if (point[0] < 0) {
      xPath = Math.floor(((360 + point[0]) * this.config.tessellation) / 180);
    } else {
      xPath = Math.floor((point[0] * this.config.tessellation) / 180);
    }

    const newFilePath = this.config.tessellation + '/' + xPath.toString() + '/' + yPath.toString() + '.hgt';

    if (this.acitveFile !== newFilePath) {
      this.acitveFile = newFilePath;
      if (!fs.existsSync(this.config.filePath + this.acitveFile)) {
        throw new Error('Missing file: ' + this.config.filePath + this.acitveFile);
      }
      this.data = fs.readFileSync(this.config.filePath + this.acitveFile, null);
    }

    let x = (point[0] - Math.floor(point[0])) * (this.config.gridSize - 1);
    let y = this.config.gridSize - 1 - (point[1] - Math.floor(point[1])) * (this.config.gridSize - 1);

    const px = [
      Math.floor(y) * this.config.gridSize * 2 + Math.floor(x) * 2,
      Math.floor(y) * this.config.gridSize * 2 + Math.ceil(x) * 2,
      Math.ceil(y) * this.config.gridSize * 2 + Math.ceil(x) * 2,
      Math.ceil(y) * this.config.gridSize * 2 + Math.floor(x) * 2,
    ];

    x = x / (this.config.gridSize - 1);
    y = y / (this.config.gridSize - 1);

    const alt = [
      parseFloat(this.data.readInt16BE(px[0])) * (1 - y) * (1 - x),
      parseFloat(this.data.readInt16BE(px[1])) * (1 - y) * x,
      parseFloat(this.data.readInt16BE(px[2])) * y * x,
      parseFloat(this.data.readInt16BE(px[3])) * y * (1 - x),
    ];

    return alt.reduce((a, b) => a + b, 0);
  }

  public async getElevationFromNodePoint(point: number[]): Promise<number> {
    const xPath = Math.floor(point[0] / (this.config.gridSize - 1));
    const x = point[0] % (this.config.gridSize - 1);

    const yPath = Math.floor(point[1] / (this.config.gridSize - 1));
    let y = point[1] % (this.config.gridSize - 1);

    const newFilePath = this.config.tessellation + '/' + xPath.toString() + '/' + yPath.toString() + '.hgt';

    if (this.acitveFile !== newFilePath) {
      this.acitveFile = newFilePath;
      if (!fs.existsSync(this.config.filePath + this.acitveFile)) {
        throw new Error('Missing file: ' + this.config.filePath + this.acitveFile);
      }
      this.data = fs.readFileSync(this.config.filePath + this.acitveFile, null);
    }

    y = this.config.gridSize - y - 1;

    const index = Math.floor(y) * this.config.gridSize * 2 + Math.floor(x) * 2;
    return parseFloat(this.data.readInt16BE(index));
  }
}

export interface HgtInterface {
  tessellation: number;
  gridSize: number;
  filePath: string;
}
