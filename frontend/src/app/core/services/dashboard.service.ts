import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { DashboardPayload, Plant } from '../models/dashboard.models';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getPlants(): Observable<Plant[]> {
    return this.http.get<Plant[]>(`${this.apiUrl}/plants/`);
  }

  getDashboard(plantId: number): Observable<DashboardPayload> {
    return this.http.get<DashboardPayload>(`${this.apiUrl}/plants/${plantId}/dashboard/`);
  }
}
