import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RailwayDiscoveryService {
  
  /**
   * Common Railway URL patterns for TiffinApp backend
   */
  private readonly possibleBackendUrls = [
    'https://tiffin-api-production.railway.app',
    'https://tiffin-api.railway.app', 
    'https://newbackendtiffinapp-production.railway.app',
    'https://backend-production.railway.app',
    'https://tiffin-backend.railway.app',
    'https://api.railway.app',
    'https://tiffin-server.railway.app'
  ];

  /**
   * Discover the working Railway backend URL
   */
  async discoverBackendUrl(): Promise<string | null> {
    console.log('[RailwayDiscovery] Starting backend discovery...');
    
    for (const baseUrl of this.possibleBackendUrls) {
      try {
        console.log(`[RailwayDiscovery] Testing: ${baseUrl}`);
        
        const response = await fetch(`${baseUrl}/api/health`, {
          method: 'GET',
          mode: 'cors',
          signal: AbortSignal.timeout(5000) // 5 second timeout
        });
        
        if (response.ok) {
          console.log(`[RailwayDiscovery] ✅ Found working backend: ${baseUrl}`);
          return `${baseUrl}/api`;
        }
        
        } catch (error) {
        console.log(`[RailwayDiscovery] ❌ Failed: ${baseUrl}`, error instanceof Error ? error.message : 'Unknown error');
      }
    }
    
    console.log('[RailwayDiscovery] No working backend found');
    return null;
  }

  /**
   * Test a specific Railway URL
   */
  async testRailwayUrl(url: string): Promise<boolean> {
    try {
      const apiUrl = url.endsWith('/api') ? url : `${url}/api`;
      const response = await fetch(`${apiUrl}/health`, {
        method: 'GET',
        mode: 'cors',
        signal: AbortSignal.timeout(3000)
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get Railway URL from project name patterns
   */
  generateRailwayUrls(projectName: string): string[] {
    const patterns = [
      `https://${projectName}-production.railway.app`,
      `https://${projectName}.railway.app`,
      `https://${projectName}-api.railway.app`,
      `https://${projectName}-backend.railway.app`,
      `https://${projectName}-server.railway.app`
    ];
    
    return patterns;
  }
}