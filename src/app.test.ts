import { Hgt, HgtInterface } from "./app";

const config: HgtInterface = {
  tessellation: 180,
  gridSize: 1201,
  filePath:"./test/1201/"
}

describe('Hgt', () => {
  it('Hgt', async () => {
      const hgt = new Hgt(config)
      const elevation = await hgt.getElevationFromCoordinate([
        9.47,
        47.34
      ])
      expect(Math.round(elevation)).toBe(1078);
  });
});
