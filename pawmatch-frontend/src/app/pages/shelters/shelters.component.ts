import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { TranslateService } from '@ngx-translate/core';

interface Shelter {
  id: number;
  name: string;
  lat: number;
  lng: number;
  phone: string | string[];
  address: string;
  instagram?: string;
  telegram?: string;
}

@Component({
  selector: 'app-shelters',
  templateUrl: './shelters.component.html',
  styleUrls: ['./shelters.component.css']
})
export class SheltersComponent implements OnInit {

  map!: L.Map;
  selectedShelter: Shelter | null = null;

  constructor(private translate: TranslateService) {}

  shelters: Shelter[] = [
    {
      id: 1,
      name: 'Happy Paws Almaty',
      lat: 43.238949,
      lng: 76.889709,
      phone: ['+7 700 123 45 67', '+7 747 555 10 10'],
      address: 'г. Алматы, ул. Толе би, 78',
      instagram: 'https://instagram.com/happypaws_almaty',
      telegram: 'https://t.me/happypaws_almaty'
    },
    {
      id: 2,
      name: 'Dog Shelter Astana',
      lat: 51.128207,
      lng: 71.430420,
      phone: ['+7 700 765 43 21'],
      address: 'г. Астана, пр. Туран, 15',
      instagram: 'https://instagram.com/dogshelter_astana',
      telegram: 'https://t.me/dogshelter_astana'
    },
    {
      id: 3,
      name: 'Cat Home Shymkent',
      lat: 42.341700,
      lng: 69.590100,
      phone: ['+7 700 111 22 33', '+7 705 900 44 88'],
      address: 'г. Шымкент, ул. Байтурсынова, 22',
      instagram: 'https://instagram.com/cathome_shymkent',
      telegram: 'https://t.me/cathome_shymkent'
    }
  ];

  markers: { [key: number]: L.Marker } = {};

  ngOnInit() {
    this.initMap();
    this.addMarkers();
  }

  initMap() {
    this.map = L.map('map').setView([43.238949, 76.889709], 11);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(this.map);
  }

  addMarkers() {
    this.shelters.forEach(shelter => {
      const marker = L.marker([shelter.lat, shelter.lng])
        .addTo(this.map)
        .bindPopup(`<b>${shelter.name}</b><br>${shelter.address}`);

      this.markers[shelter.id] = marker;
    });
  }

  showOnMap(shelter: Shelter) {
    this.map.setView([shelter.lat, shelter.lng], 14);
    this.markers[shelter.id].openPopup();
  }

  openCallModal(shelter: Shelter) {
    this.selectedShelter = shelter;
  }

  closeCallModal() {
    this.selectedShelter = null;
  }

  getShelterPhones(shelter: Shelter | null): string[] {
    if (!shelter) {
      return [];
    }

    return Array.isArray(shelter.phone) ? shelter.phone : [shelter.phone];
  }
}
