import { Hgt, HgtInterface } from './app';

const offline: HgtInterface = {
  tessellation: 180,
  gridSize: 1201,
  filePath: './test/1201/{tessellation}/{x}/{y}.hgt',
};

const online: HgtInterface = {
  tessellation: 180,
  gridSize: 1201,
  filePath: 'http://test/1201/{tessellation}/{x}/{y}.hgt',
};

describe('Hgt', () => {
  it('offline', async () => {
    const hgt = new Hgt(offline);
    const elevation = await hgt.getElevationFromCoordinate([9.47, 47.34]);
    expect(Math.round(elevation)).toBe(1078);
  });
  it('online', () => {
    const hgt = new Hgt(online);
    expect(hgt.filePathIsUrl).toBe(true);
  });
});
