import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { CommonService } from '../../services/common.service';
import { MaterialDesignModule } from '../../shared/material-design.module';

@Component({
  selector: 'app-video-dialog',
  standalone: true,
  imports: [MaterialDesignModule],
  templateUrl: './video-dialog.component.html',
  styleUrl: './video-dialog.component.scss',
})
export class VideoDialogComponent {
  video: any[] = [];
  videoUrl: any;
  videoLoading: boolean = false

  constructor(
    public common: CommonService,
    public dialogRef: MatDialogRef<VideoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { videodata: any },
    private http: HttpClient
  ) {
  }

  /**
   * Lifecycle hook that is called after the component has been initialized.
   * This method sets the `common.component` property to `'videos'` and
   * triggers the video playback by calling the `playVideo` method.
   *
   * @returns {void}
   */
  ngOnInit(): void {
    this.common.component = 'videos';
    this.playVideo();
  }

  /**
   * Asynchronously fetches a video from a specified URL and prepares it for playback.
   *
   * This method performs the following steps:
   * 1. Constructs the URL to fetch the video using the `videodata` property.
   * 2. Sends a GET request to the video URL and expects a response of type `blob`.
   * 3. If the request is successful, it converts the response to a Blob and creates a URL for the video.
   * 4. The resulting URL is assigned to the `videoUrl` property for use in the component's template.
   *
   * If an error occurs during the fetching process, it logs the error to the console.
   *
   * @async
   * @returns {Promise<void>} A promise that resolves when the video is successfully fetched and prepared for playback.
   */
  async playVideo(): Promise<void> {
    try {
      this.videoLoading = true
      const url = `${this.data.videodata}/`;
      const response = await lastValueFrom(
        this.http.get(url, { responseType: 'blob' })
      );
      const videoBlob = response as Blob;
      this.videoLoading = false
      this.videoUrl = URL.createObjectURL(videoBlob);
    } catch (error: any) {
      this.videoLoading = false
      this.common.openSnackBar( 'Error fetching video:', error);
    }
  }
}
