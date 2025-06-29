class LocationService {
    async requestLocationPermission() {
      try {
        if (navigator.geolocation) {
          return new Promise((resolve) => {
            navigator.permissions.query({ name: 'geolocation' }).then(permissionStatus => {
              resolve(permissionStatus.state === 'granted' || permissionStatus.state === 'prompt');
            });
          });
        }
        return false;
      } catch (error) {
        console.error('Error requesting location permission:', error);
        return false;
      }
    }
    
    async getCurrentLocation() {
      return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation is not supported by this browser'));
          return;
        }
        
        navigator.geolocation.getCurrentPosition(
          position => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            });
          },
          error => {
            reject(error);
          }
        );
      });
    }
    
    estimateWalkingTime(coord1, coord2) {
      const distance = this.calculateDistance(coord1, coord2);
      // Average walking speed: 5km/h = 83.33m/min
      return Math.round(distance / 83.33);
    }
    
    calculateDistance(coord1, coord2) {
      // Haversine formula to calculate distance between two coordinates
      const R = 6371e3; // Earth radius in meters
      const φ1 = this.toRadians(coord1.latitude);
      const φ2 = this.toRadians(coord2.latitude);
      const Δφ = this.toRadians(coord2.latitude - coord1.latitude);
      const Δλ = this.toRadians(coord2.longitude - coord1.longitude);
      
      const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      
      return R * c; // Distance in meters
    }
    
    toRadians(degrees) {
      return degrees * Math.PI / 180;
    }
  }
  
  export default LocationService;
  