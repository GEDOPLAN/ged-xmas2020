import {AfterViewInit, Component, ElementRef, QueryList, Renderer2, ViewChild, ViewChildren} from '@angular/core';
import {Observable, Subscription, timer} from 'rxjs';

@Component({
  selector: 'ged-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  @ViewChild('snowman')
  snowman: ElementRef;

  @ViewChildren('g,e,d,o,p,l,a,n')
  letters: QueryList<ElementRef>;

  letterIndex = 0;

  jumpTime: number;

  jumps = 0;

  jumpTimer: Observable<any>;

  currentJump: Subscription;

  speed = 1;

  constructor(private renderer: Renderer2) {
  }

  init(): void {
    this.renderer.removeClass(this.snowman.nativeElement, 'jump1');
    this.renderer.removeClass(this.snowman.nativeElement, 'jump2');
    this.renderer.removeClass(this.snowman.nativeElement, 'jump3');
    this.renderer.removeClass(this.snowman.nativeElement, 'over');
    this.jumps = 0;
  }

  private reset(): void {
    // do fail stuff
    const letterArray = this.letters.toArray();
    timer(0, this.speed).subscribe(() => {
      const letter = letterArray[this.letterIndex].nativeElement;
      const current: string = getComputedStyle(letter).left;
      const newLeft = Number.parseInt(current.replace('px', ''), 10) - 10;
      letter.style.left = newLeft + 'px';
      if (newLeft < 0) {
        letter.style.display = 'none';

        this.letterIndex++;
      }
    });
    this.init();
  }

  private clearSubscription(): void {
    if (this.currentJump && !this.currentJump.closed) {
      this.currentJump.unsubscribe();
    }
  }

  jump(): void {
    this.jumps = this.jumps + 1;
    if (this.jumps > 3) {
      this.clearSubscription();
      this.renderer.addClass(this.snowman.nativeElement, 'over');
      this.currentJump = this.jumpTimer.subscribe(() => {
        this.reset();
      });
      return;
    }
    this.renderer.addClass(this.snowman.nativeElement, 'jump' + this.jumps);

    this.clearSubscription();
    this.currentJump = this.jumpTimer.subscribe(() => {
      this.init();
    });
  }

  ngAfterViewInit(): void {
    const jumpTime = getComputedStyle(this.snowman.nativeElement).getPropertyValue('--jump-time');
    this.jumpTime = Number.parseInt(jumpTime, 10);
    this.jumpTimer = timer(this.jumpTime);

    this.reset();
  }
}
