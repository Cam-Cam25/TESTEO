import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CameraService } from '../../services/camera.service';
import { GeminiService } from '../../services/gemini.service';
import { ESP32Service } from '../../services/esp32.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-photo-analyzer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <h1>Analizador de Fotos con IA</h1>
      
      <div class="actions">
        <button (click)="takePicture()" class="btn primary">Tomar Foto</button>
        <button (click)="selectFromGallery()" class="btn secondary">Seleccionar de Galería</button>
      </div>

      <div *ngIf="imageBase64" class="preview">
        <img [src]="'data:image/jpeg;base64,' + imageBase64" alt="Preview" />
      </div>

      <div *ngIf="analyzing" class="loading">
        <p>Analizando imagen...</p>
      </div>

      <div *ngIf="analysis" class="analysis">
        <h2>Análisis de la Imagen</h2>
        <p>{{ analysis }}</p>
      </div>
    </div>
  `,
  styles: [`
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }

    h1 {
      text-align: center;
      color: #333;
    }

    .actions {
      display: flex;
      gap: 10px;
      justify-content: center;
      margin: 20px 0;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 16px;
      transition: background-color 0.3s;
    }

    .primary {
      background-color: #007bff;
      color: white;
    }

    .secondary {
      background-color: #6c757d;
      color: white;
    }

    .preview {
      margin: 20px 0;
      text-align: center;
    }

    .preview img {
      max-width: 100%;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .loading {
      text-align: center;
      margin: 20px 0;
    }

    .analysis {
      background-color: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin-top: 20px;
    }
  `]
})
export class PhotoAnalyzerComponent implements OnInit, OnDestroy {
  imageBase64: string | undefined;
  analysis: string | undefined;
  analyzing = false;
  private subscription: Subscription | undefined;

  constructor(
    private cameraService: CameraService,
    private geminiService: GeminiService,
    private esp32Service: ESP32Service
  ) {}

  ngOnInit() {
    this.subscription = this.esp32Service.objectDetected$.subscribe(() => {
      this.takePicture();
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  async takePicture() {
    try {
      this.imageBase64 = await this.cameraService.takePicture();
      await this.analyzeImage();
    } catch (error) {
      console.error('Error al tomar la foto:', error);
    }
  }

  async selectFromGallery() {
    try {
      this.imageBase64 = await this.cameraService.selectFromGallery();
      await this.analyzeImage();
    } catch (error) {
      console.error('Error al seleccionar la foto:', error);
    }
  }

  private async analyzeImage() {
    if (!this.imageBase64) return;

    this.analyzing = true;
    try {
      this.analysis = await this.geminiService.analyzeImage(this.imageBase64);
    } catch (error) {
      console.error('Error al analizar la imagen:', error);
    } finally {
      this.analyzing = false;
    }
  }
}