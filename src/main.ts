import './style.css'
import { Map, View } from 'ol'
import TileLayer from 'ol/layer/Tile'
import OSM from 'ol/source/OSM'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import GeoJSON from 'ol/format/GeoJSON'
import Select from 'ol/interaction/Select'
import { click } from 'ol/events/condition'
import { fromLonLat, toLonLat } from 'ol/proj'
import { Style, Stroke, Fill, Icon } from 'ol/style'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import Overlay from 'ol/Overlay'

// Import assets
import vnJsonUrl from '/vn.json?url'
import pinSvgUrl from '/pin.svg?url'

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
      <div class="landmarks-section">
        <h3>Địa danh đã pin</h3>
        <p style="font-size: 12px; color: #666; margin: 0 0 10px 0; font-style: italic;">
          💡 Click đúp vào bản đồ để thêm địa danh
        </p>
        <div class="landmarks-list" id="landmarks-list">
          <p style="text-align: center; color: #999; padding: 20px;">Chưa có địa danh nào</p>
        </div>
      </div>
    </div>
    <div class="map-container">
      <div id="map"></div>
    </div>
  </div>

  <!-- Modal for adding landmark -->
  <div id="landmark-modal" class="modal">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Thêm địa danh</h2>
        <span class="close">&times;</span>
      </div>
      <form id="landmark-form">
        <div class="form-group">
          <label for="landmark-title">Tiêu đề:</label>
          <input type="text" id="landmark-title" name="title" required>
        </div>
        <div class="form-group">
          <label for="landmark-thumbnail">URL Thumbnail:</label>
          <input type="url" id="landmark-thumbnail" name="thumbnail" placeholder="https://example.com/image.jpg">
        </div>
        <div class="form-group">
          <label for="landmark-description">Mô tả:</label>
          <textarea id="landmark-description" name="description" required></textarea>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" id="cancel-landmark">Hủy</button>
          <button type="submit" class="btn btn-primary">Thêm địa danh</button>
        </div>
      </form>
    </div>
  </div>
`

// Interface cho địa danh
interface Landmark {
  id: string
  title: string
  description: string
  thumbnail?: string
  latitude: number
  longitude: number
  createdAt: Date
}

// Tạo vector layer để load GeoJSON
const provinceVectorSource = new VectorSource({
  url: vnJsonUrl,
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

// Tạo vector source và layer cho landmarks
const landmarksVectorSource = new VectorSource()

const landmarksVectorLayer = new VectorLayer({
  source: landmarksVectorSource,
  style: new Style({
    image: new Icon({
      anchor: [0.5, 1],
      anchorXUnits: 'fraction',
      anchorYUnits: 'fraction',
      src: pinSvgUrl,
      scale: 0.8
    })
  })
})

// Khởi tạo bản đồ
const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      source: new OSM()
    }),
    provinceVectorLayer,
    landmarksVectorLayer
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

// Tạo popup overlay
const popupElement = document.createElement('div')
popupElement.className = 'ol-popup'
popupElement.innerHTML = '<div id="popup-content"></div>'

const popup = new Overlay({
  element: popupElement,
  autoPan: {
    animation: {
      duration: 250,
    },
  },
})
map.addOverlay(popup)

// Biến để lưu danh sách các tỉnh và landmarks
let provinces: Array<{ id: string, name: string }> = []
let landmarks: Landmark[] = []
let currentClickCoordinate: [number, number] | null = null

// Hàm helper cho localStorage
function saveLandmarksToStorage(landmarks: Landmark[]) {
  localStorage.setItem('landmarks', JSON.stringify(landmarks))
}

function loadLandmarksFromStorage(): Landmark[] {
  const stored = localStorage.getItem('landmarks')
  if (stored) {
    return JSON.parse(stored).map((item: any) => ({
      ...item,
      createdAt: new Date(item.createdAt)
    }))
  }
  return []
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// Hàm để thêm landmark vào bản đồ
function addLandmarkToMap(landmark: Landmark) {
  const feature = new Feature({
    geometry: new Point(fromLonLat([landmark.longitude, landmark.latitude])),
    landmark: landmark
  })

  landmarksVectorSource.addFeature(feature)
}

// Hàm để load tất cả landmarks lên bản đồ
function loadLandmarksToMap() {
  landmarksVectorSource.clear()
  landmarks.forEach(landmark => addLandmarkToMap(landmark))
}

// Hàm để cập nhật danh sách landmarks trong sidebar
function updateLandmarksList() {
  const landmarksList = document.getElementById('landmarks-list')!

  if (landmarks.length === 0) {
    landmarksList.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">Chưa có địa danh nào</p>'
    return
  }

  landmarksList.innerHTML = landmarks.map(landmark => `
    <div class="landmark-item">
      <span class="landmark-title" onclick="focusLandmark('${landmark.id}')">${landmark.title}</span>
      <button class="landmark-delete" onclick="deleteLandmark('${landmark.id}')">Xóa</button>
    </div>
  `).join('')
}

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

// Xử lý double click để thêm landmark
map.on('dblclick', (event) => {
  // Chỉ xử lý khi click vào map, không phải vào UI elements
  const target = event.originalEvent.target as HTMLElement
  if (target && target.closest('.modal')) {
    return // Không xử lý nếu click vào modal
  }

  event.preventDefault()
  const coordinate = event.coordinate
  const lonLat = toLonLat(coordinate)
  currentClickCoordinate = [lonLat[0], lonLat[1]]

  // Mở modal
  const modal = document.getElementById('landmark-modal')!
  modal.style.display = 'block'

  // Focus vào input đầu tiên
  setTimeout(() => {
    const titleInput = document.getElementById('landmark-title') as HTMLInputElement
    titleInput?.focus()
  }, 100)
})

// Xử lý hover trên landmarks để hiện popup
let currentPopupFeature: any = null

map.on('pointermove', (event) => {
  const feature = map.forEachFeatureAtPixel(event.pixel, (feature) => {
    if (feature.get('landmark')) {
      return feature
    }
  })

  if (feature && feature !== currentPopupFeature) {
    const landmark = feature.get('landmark') as Landmark
    const coordinate = (feature.getGeometry() as Point).getCoordinates()

    const popupContent = document.getElementById('popup-content')!
    popupContent.innerHTML = `
      <div class="popup-content">
        ${landmark.thumbnail ? `<img src="${landmark.thumbnail}" alt="${landmark.title}" class="popup-thumbnail" onerror="this.style.display='none'">` : ''}
        <div class="popup-info">
          <div class="popup-title">${landmark.title}</div>
          <p class="popup-description">${landmark.description}</p>
        </div>
      </div>
    `

    popup.setPosition(coordinate)
    currentPopupFeature = feature
  } else if (!feature && currentPopupFeature) {
    popup.setPosition(undefined)
    currentPopupFeature = null
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

// Load landmarks từ localStorage khi khởi động
landmarks = loadLandmarksFromStorage()
updateLandmarksList()
loadLandmarksToMap()

// Xử lý modal events
const modal = document.getElementById('landmark-modal')!
const closeBtn = modal.querySelector('.close')!
const cancelBtn = document.getElementById('cancel-landmark')!
const landmarkForm = document.getElementById('landmark-form') as HTMLFormElement

closeBtn.addEventListener('click', () => {
  modal.style.display = 'none'
  landmarkForm.reset()
  currentClickCoordinate = null
})

cancelBtn.addEventListener('click', () => {
  modal.style.display = 'none'
  landmarkForm.reset()
  currentClickCoordinate = null
})

// Đóng modal khi click outside
window.addEventListener('click', (event) => {
  if (event.target === modal) {
    modal.style.display = 'none'
    landmarkForm.reset()
    currentClickCoordinate = null
  }
})

// Đóng modal khi nhấn ESC
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && modal.style.display === 'block') {
    modal.style.display = 'none'
    landmarkForm.reset()
    currentClickCoordinate = null
  }
})

// Xử lý submit form
landmarkForm.addEventListener('submit', (event) => {
  event.preventDefault()

  if (!currentClickCoordinate) return

  const formData = new FormData(landmarkForm)
  const landmark: Landmark = {
    id: generateId(),
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    thumbnail: formData.get('thumbnail') as string || undefined,
    latitude: currentClickCoordinate[1],
    longitude: currentClickCoordinate[0],
    createdAt: new Date()
  }

  landmarks.push(landmark)
  saveLandmarksToStorage(landmarks)
  addLandmarkToMap(landmark)
  updateLandmarksList()

  modal.style.display = 'none'
  landmarkForm.reset()
  currentClickCoordinate = null
})

// Global functions for landmark management
declare global {
  function focusLandmark(id: string): void
  function deleteLandmark(id: string): void
}

window.focusLandmark = function (id: string) {
  const landmark = landmarks.find(l => l.id === id)
  if (landmark) {
    const coordinate = fromLonLat([landmark.longitude, landmark.latitude])
    map.getView().animate({
      center: coordinate,
      zoom: 12,
      duration: 1000
    })
  }
}

window.deleteLandmark = function (id: string) {
  if (confirm('Bạn có chắc chắn muốn xóa địa danh này?')) {
    landmarks = landmarks.filter(l => l.id !== id)
    saveLandmarksToStorage(landmarks)
    updateLandmarksList()
    loadLandmarksToMap()
  }
}