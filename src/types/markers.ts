export interface CustomMarker {
  id: string;
  lat: number;
  lon: number;
  title: string;
  description?: string;
  color: 'red' | 'blue' | 'green' | 'orange' | 'purple';
  createdAt: Date;
  tags?: string[]; // Add tags property
}

export interface MarkerFormData {
  title: string;
  description: string;
  color: CustomMarker['color'];
  tags?: string[]; // Add tags property to form data
}
