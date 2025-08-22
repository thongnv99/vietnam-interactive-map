import './style.css'
import { Map, View } from 'ol'
import TileLayer from 'ol/layer/Tile'
import OSM from 'ol/source/OSM'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import GeoJSON from 'ol/format/GeoJSON'
import Select from 'ol/interaction/Select'
import { click } from 'ol/events/condition'
import { fromLonLat } from 'ol/proj'
import { Style, Stroke, Fill } from 'ol/style'

// Tạo HTML layout
document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="container">
    <div class="sidebar">
      <h1>Bản đồ Việt Nam</h1>
      <div class="province-selector">
        <label for="province-select">Chọn Tỉnh/Thành phố:</label>
        <select id="province-select">
          <option value="">-- Chọn tỉnh thành --</option>
        </select>
      </div>
      <div id="info-panel">
        <p>Click vào tỉnh để xem thông tin chi tiết</p>
      </div>
    </div>
    <div class="map-container">
      <div id="map"></div>
    </div>
  </div>
`

// Tạo vector layer để load GeoJSON
const provinceVectorSource = new VectorSource({
  url: '/vn.json',
  format: new GeoJSON()
})

const provinceVectorLayer = new VectorLayer({
  source: provinceVectorSource,
  style: new Style({
    stroke: new Stroke({
      color: 'transparent', // Ẩn ranh giới khi không được chọn
      width: 0
    }),
    fill: new Fill({
      color: 'transparent' // Ẩn background
    })
  })
})

// Style cho tỉnh được chọn
const selectedStyle = new Style({
  stroke: new Stroke({
    color: '#ff0000', // Màu đỏ
    width: 2,
    lineDash: [5, 5] // Nét đứt
  }),
  fill: new Fill({
    color: 'transparent' // Không có background
  })
})

// Khởi tạo bản đồ
const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      source: new OSM()
    }),
    provinceVectorLayer
  ],
  view: new View({
    center: fromLonLat([106.6297, 14.0583]), // Trung tâm Việt Nam
    zoom: 6
  })
})

// Tạo Select interaction để chọn tỉnh
const selectInteraction = new Select({
  condition: click,
  style: selectedStyle,
  layers: [provinceVectorLayer]
})

map.addInteraction(selectInteraction)

// Biến để lưu danh sách các tỉnh
let provinces: Array<{ id: string, name: string }> = []

// Lắng nghe sự kiện khi GeoJSON được load xong
provinceVectorSource.on('featuresloadend', () => {
  // Lấy danh sách các tỉnh từ GeoJSON
  provinceVectorSource.forEachFeature((feature) => {
    const provinceId = feature.get('id')
    const provinceName = feature.get('name')
    if (provinceId && provinceName) {
      provinces.push({ id: provinceId, name: provinceName })
    }
  })

  // Sắp xếp theo tên tỉnh
  provinces.sort((a, b) => a.name.localeCompare(b.name, 'vi'))

  // Cập nhật dropdown với danh sách tỉnh
  const provinceSelect = document.getElementById('province-select') as HTMLSelectElement

  provinces.forEach(province => {
    const option = document.createElement('option')
    option.value = province.id
    option.textContent = province.name
    provinceSelect.appendChild(option)
  })
})

// Xử lý sự kiện khi click vào feature trên bản đồ
selectInteraction.on('select', (event) => {
  const selectedFeatures = event.target.getFeatures()
  const infoPanel = document.getElementById('info-panel')!

  if (selectedFeatures.getLength() > 0) {
    const feature = selectedFeatures.item(0)
    const provinceId = feature.get('id') || 'N/A'
    const provinceName = feature.get('name') || 'N/A'

    infoPanel.innerHTML = `
      <h3>Thông tin tỉnh/thành phố</h3>
      <p><strong>Tên:</strong> ${provinceName}</p>
      <p><strong>Mã:</strong> ${provinceId}</p>
    `

    // Cập nhật dropdown theo tỉnh được chọn
    const provinceSelect = document.getElementById('province-select') as HTMLSelectElement
    provinceSelect.value = provinceId

    // Fit view đến feature được chọn
    const geometry = feature.getGeometry()
    if (geometry) {
      const extent = geometry.getExtent()
      map.getView().fit(extent, { padding: [50, 50, 50, 50], duration: 1000 })
    }
  } else {
    infoPanel.innerHTML = '<p>Click vào tỉnh để xem thông tin chi tiết</p>'
  }
})

// Xử lý sự kiện thay đổi selection từ dropdown
const provinceSelect = document.getElementById('province-select') as HTMLSelectElement
provinceSelect.addEventListener('change', (event) => {
  const selectedProvinceId = (event.target as HTMLSelectElement).value

  // Xóa selection hiện tại
  selectInteraction.getFeatures().clear()

  if (selectedProvinceId) {
    // Tìm và chọn feature tỉnh được chọn
    provinceVectorSource.forEachFeature((feature) => {
      const featureProvinceId = feature.get('id')
      if (featureProvinceId === selectedProvinceId) {
        selectInteraction.getFeatures().push(feature)

        // Fit view đến tỉnh được chọn
        const geometry = feature.getGeometry()
        if (geometry) {
          const extent = geometry.getExtent()
          map.getView().fit(extent, { padding: [50, 50, 50, 50], duration: 1000 })
        }

        // Cập nhật info panel
        const provinceName = feature.get('name') || 'N/A'
        const infoPanel = document.getElementById('info-panel')!
        infoPanel.innerHTML = `
          <h3>Thông tin tỉnh/thành phố</h3>
          <p><strong>Tên:</strong> ${provinceName}</p>
          <p><strong>Mã:</strong> ${selectedProvinceId}</p>
        `
        return true // Dừng việc tìm kiếm
      }
    })
  } else {
    // Reset về view toàn Việt Nam
    map.getView().animate({
      center: fromLonLat([106.6297, 14.0583]),
      zoom: 6,
      duration: 1000
    })

    const infoPanel = document.getElementById('info-panel')!
    infoPanel.innerHTML = '<p>Click vào tỉnh để xem thông tin chi tiết</p>'
  }
})