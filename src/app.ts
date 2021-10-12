import * as fs from 'fs-extra';
import * as request from 'request';

export class Hgt {
  public filePathIsUrl: boolean = false;

  private config: HgtInterface;
  private data: any;
  private acitveFile: string = '';

  constructor(config: HgtInterface) {
    this.config = config;
    this.filePathIsUrl = this.isfilePathUrl(config.filePath);
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
      if (this.filePathIsUrl) {
        this.data = await this.fetch(
          this.config.filePath
            .replace('{tessellation}', this.config.tessellation.toString())
            .replace('{x}', xPath.toString())
            .replace('{y}', yPath.toString()),
        );
      } else if (
        !fs.existsSync(
          this.config.filePath
            .replace('{tessellation}', this.config.tessellation.toString())
            .replace('{x}', xPath.toString())
            .replace('{y}', yPath.toString()),
        ) &&
        !this.filePathIsUrl
      ) {
        throw new Error(
          'Missing file: ' +
            this.config.filePath
              .replace('{tessellation}', this.config.tessellation.toString())
              .replace('{x}', xPath.toString())
              .replace('{y}', yPath.toString()),
        );
      } else {
        this.data = fs.readFileSync(
          this.config.filePath
            .replace('{tessellation}', this.config.tessellation.toString())
            .replace('{x}', xPath.toString())
            .replace('{y}', yPath.toString()),
          null,
        );
      }
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
      if (this.filePathIsUrl) {
        this.data = await this.fetch(
          this.config.filePath
            .replace('{tessellation}', this.config.tessellation.toString())
            .replace('{x}', xPath.toString())
            .replace('{y}', yPath.toString()),
        );
      } else if (
        !fs.existsSync(
          this.config.filePath
            .replace('{tessellation}', this.config.tessellation.toString())
            .replace('{x}', xPath.toString())
            .replace('{y}', yPath.toString()),
        ) &&
        !this.filePathIsUrl
      ) {
        throw new Error(
          'Missing file: ' +
            this.config.filePath
              .replace('{tessellation}', this.config.tessellation.toString())
              .replace('{x}', xPath.toString())
              .replace('{y}', yPath.toString()),
        );
      } else {
        this.data = fs.readFileSync(
          this.config.filePath
            .replace('{tessellation}', this.config.tessellation.toString())
            .replace('{x}', xPath.toString())
            .replace('{y}', yPath.toString()),
          null,
        );
      }
    }

    y = this.config.gridSize - y - 1;

    const index = Math.floor(y) * this.config.gridSize * 2 + Math.floor(x) * 2;
    return parseFloat(this.data.readInt16BE(index));
  }

  private isfilePathUrl(path: string): boolean {
    if (path.search(/^http/i) === -1) {
      return false;
    } else {
      return true;
    }
  }

  private fetch(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const options = {
        method: 'GET',
        url,
        encoding: null,
        timeout: 5000,
      };

      request(options, (error, response, body) => {
        if (error) {
          reject(error);
        } else {
          if (response.statusCode < 400) {
            resolve(body);
          } else {
            reject();
          }
        }
      });
    });
  }
}

export interface HgtInterface {
  tessellation: number;
  gridSize: number;
  filePath: string;
}
