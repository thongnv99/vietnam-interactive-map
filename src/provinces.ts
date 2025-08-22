export interface Province {
  id: string;
  name: string;
  center: [number, number]; // [longitude, latitude]
  bbox: [number, number, number, number]; // [minLon, minLat, maxLon, maxLat]
}

export const vietnamProvinces: Province[] = [
  {
    id: "hanoi",
    name: "Hà Nội",
    center: [105.8544, 21.0285],
    bbox: [105.3449, 20.5316, 106.0156, 21.3647]
  },
  {
    id: "hcm",
    name: "TP. Hồ Chí Minh",
    center: [106.6297, 10.8231],
    bbox: [106.3613, 10.3496, 107.0078, 11.1612]
  },
  {
    id: "haiphong",
    name: "Hải Phòng",
    center: [106.6881, 20.8449],
    bbox: [106.4453, 20.6636, 107.0781, 21.0262]
  },
  {
    id: "danang",
    name: "Đà Nẵng",
    center: [108.2022, 16.0471],
    bbox: [107.9199, 15.8867, 108.4844, 16.2075]
  },
  {
    id: "cantho",
    name: "Cần Thơ",
    center: [105.7851, 10.0452],
    bbox: [105.4297, 9.8838, 106.1406, 10.2066]
  },
  {
    id: "halong",
    name: "Quảng Ninh",
    center: [107.0431, 20.9531],
    bbox: [106.4453, 20.5316, 107.6406, 21.3647]
  },
  {
    id: "hue",
    name: "Thừa Thiên Huế",
    center: [107.5955, 16.4674],
    bbox: [107.1973, 16.0471, 107.9934, 16.8877]
  },
  {
    id: "nhatrang",
    name: "Khánh Hòa",
    center: [109.1967, 12.2388],
    bbox: [108.7207, 11.6978, 109.6728, 12.7798]
  },
  {
    id: "dalat",
    name: "Lâm Đồng",
    center: [108.4380, 11.9404],
    bbox: [107.7246, 11.3594, 109.1514, 12.5209]
  },
  {
    id: "vungtau",
    name: "Bà Rịa - Vũng Tàu",
    center: [107.0831, 10.4113],
    bbox: [106.7773, 10.0952, 107.3887, 10.7273]
  }
];
