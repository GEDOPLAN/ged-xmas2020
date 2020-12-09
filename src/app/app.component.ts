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

  jumpHeight = 150;

  jumpStart = 150;

  currentJump: Subscription;

  currentRun: Subscription;

  speed = 10;

  showMessage = false;

  constructor(private renderer: Renderer2) {
  }

  init(): void {
    this.renderer.removeClass(this.snowman.nativeElement, 'jump1');
    this.renderer.removeClass(this.snowman.nativeElement, 'jump2');
    this.renderer.removeClass(this.snowman.nativeElement, 'jump3');
    this.renderer.removeClass(this.snowman.nativeElement, 'over');
    this.renderer.removeClass(this.snowman.nativeElement, 'down');

    this.snowman.nativeElement.style.bottom = this.jumpStart + 'px';
    this.jumps = 0;
  }

  private reset(): void {
    // do fail stuff
    this.letters.forEach(l => l.nativeElement.style.left = '1300px');
    this.letterIndex = 0;
    if (this.currentRun) {
      this.currentRun.unsubscribe();
    }
    //
    const letterArray = this.letters.toArray();
    this.currentRun = timer(0, this.speed).subscribe(() => {
      const letter = letterArray[this.letterIndex].nativeElement;
      const current: string = getComputedStyle(letter).left;
      const newLeft = this.addPixelToNumber(current, -0.5 * this.speed);
      if (this.checkCollision(letterArray[this.letterIndex], this.snowman)) {
        this.renderer.addClass(this.snowman.nativeElement, 'down');
        this.currentRun.unsubscribe();
        setTimeout(() => {
          this.init();
          this.reset();
        }, 3000);
        return;
      }
      letter.style.left = newLeft + 'px';
      if (newLeft < -250) {
        this.letterIndex++;
        if (this.letterIndex > 7) {
          this.currentRun.unsubscribe();
          this.showMessage = true;
        } else {
        letterArray[this.letterIndex].nativeElement.style.bottom = Math.floor(Math.random() * 250) + this.jumpStart + 'px';
        }
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
    if (this.jumps > 3 ) {
      this.clearSubscription();
      this.renderer.addClass(this.snowman.nativeElement, 'over');
      this.currentJump = this.jumpTimer.subscribe(() => {
        this.reset();
      });
      return;
    }

    this.renderer.setStyle(
      this.snowman.nativeElement,
      'bottom',
      this.addPixelToPixel(getComputedStyle(this.snowman.nativeElement).bottom, this.jumpHeight)
    );


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

  checkCollision(ele1: ElementRef, ele2: ElementRef): boolean {
    const rect1 = ele2.nativeElement.getBoundingClientRect();
    const rect2 = ele1.nativeElement.getBoundingClientRect();

    return !(rect1.right < rect2.left ||
      rect1.left > rect2.right ||
      rect1.bottom < rect2.top ||
      rect1.top > rect2.bottom);
  }

  addPixelToPixel(value: string, add: number): string {
    return this.addPixelToNumber(value, add) + 'px';
  }

  addPixelToNumber(value: string, add: number): number {
    return Number.parseInt(value.replace('px', ''), 10) + add;
  }
}
