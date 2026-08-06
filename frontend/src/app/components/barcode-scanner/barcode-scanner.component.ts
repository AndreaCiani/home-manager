import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  inject,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';

/**
 * Full-screen camera overlay that scans a barcode and emits its value.
 * Uses ZXing so it works across browsers, including iOS Safari.
 * Requires a secure context (HTTPS or localhost) for camera access.
 */
@Component({
  selector: 'app-barcode-scanner',
  template: `
    <div class="fixed inset-0 z-50 flex flex-col bg-black/90">
      <div class="flex items-center justify-between p-4 text-white">
        <span class="text-sm font-medium">📷 Scan a barcode</span>
        <button
          type="button"
          class="rounded-lg px-3 py-1 text-sm font-medium text-white/90 hover:bg-white/10"
          (click)="cancel()"
        >
          Cancel
        </button>
      </div>

      <div class="flex flex-1 items-center justify-center p-4">
        @if (error()) {
          <p class="max-w-sm text-center text-sm text-red-300">{{ error() }}</p>
        } @else {
          <div class="relative w-full max-w-md">
            <video
              #video
              class="w-full rounded-2xl bg-black"
              autoplay
              muted
              playsinline
            ></video>
            <div class="pointer-events-none absolute inset-6 rounded-xl border-2 border-emerald-400/80"></div>
            @if (starting()) {
              <p class="mt-3 text-center text-sm text-white/70">Starting camera…</p>
            } @else {
              <p class="mt-3 text-center text-sm text-white/70">Point the camera at a barcode.</p>
            }
          </div>
        }
      </div>
    </div>
  `,
})
export class BarcodeScannerComponent implements AfterViewInit, OnDestroy {
  /** Emits the decoded barcode text. */
  readonly scanned = output<string>();
  /** Emits when the user cancels without scanning. */
  readonly closed = output<void>();

  private readonly video = viewChild.required<ElementRef<HTMLVideoElement>>('video');
  private readonly zone = inject(NgZone);
  private readonly reader = new BrowserMultiFormatReader();
  private controls?: IScannerControls;

  protected readonly starting = signal(true);
  protected readonly error = signal<string | null>(null);

  async ngAfterViewInit(): Promise<void> {
    try {
      this.controls = await this.reader.decodeFromConstraints(
        { video: { facingMode: 'environment' } },
        this.video().nativeElement,
        (result, _err, controls) => {
          if (!result) return; // no barcode in this frame — keep scanning
          controls.stop();
          this.zone.run(() => this.scanned.emit(result.getText()));
        },
      );
      this.zone.run(() => this.starting.set(false));
    } catch {
      this.zone.run(() => {
        this.error.set(
          'Cannot access the camera. Allow camera permission and make sure the app is served over HTTPS (or localhost).',
        );
        this.starting.set(false);
      });
    }
  }

  protected cancel(): void {
    this.controls?.stop();
    this.closed.emit();
  }

  ngOnDestroy(): void {
    this.controls?.stop();
  }
}
