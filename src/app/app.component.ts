import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, HostListener } from '@angular/core';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {

  @ViewChild("game") table: ElementRef;
  @HostListener('window:keydown', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (event.keyCode === 65 && this.paddle1Y > 20) {
      this.paddle1Y -= 20;
      console.log(this.paddle2Y, this.table.nativeElement.height);
    }
    else if (event.keyCode === 90 && this.paddle1Y < this.table.nativeElement.height - 220) {
      this.paddle1Y += 20;
      console.log(this.paddle2Y, this.table.nativeElement.height);
    }
  }

  paddle1X = 0;
  left = true;
  player1Score = 0;
  player2Score = 0;
  speedX = 10;
  speedY = 2;
  circleX;
  circleY;
  paddle1Y;
  paddle2X;
  paddle2Y;

  private context;

  // establish connnection to socket server
  ngOnInit() {
    window.addEventListener('load', this.animateBall);

    window.addEventListener('load', this.drawBall);

    window.addEventListener('mousewheel', this.movePaddle2);

    window.addEventListener('onresize', this.drawScreen);

    window.addEventListener('onkeydown', (e: KeyboardEvent) => {

      if (e.keyCode === 38) {
        // speedX++;
        // speedY++;
      }
      else if (e.keyCode === 40) {
        // speedX--;
        // speedY--;n
      }
      else if (e.keyCode === 65 && this.paddle1Y > 20) {
        this.paddle1Y -= 20;
        console.log(this.paddle2Y, this.table.nativeElement.height);
      }
      else if (e.keyCode === 90 && this.paddle1Y < this.table.nativeElement.height - 220) {
        this.paddle1Y += 20;
        console.log(this.paddle2Y, this.table.nativeElement.height);
      }

    })
  }

  ngAfterViewInit() {

    this.context = this.table.nativeElement.getContext('2d');
    this.circleX = this.table.nativeElement.width / 2;
    this.circleY = this.table.nativeElement.height / 2;
    this.paddle1Y = this.table.nativeElement.height / 2 - 100;
    this.paddle2X = this.table.nativeElement.width - 40;
    this.paddle2Y = this.table.nativeElement.height / 2 - 100;

  }

  drawScreen = () => {
    this.table.nativeElement.height = window.innerHeight
    this.table.nativeElement.width = window.innerWidth;
    this.context.clearRect(0, 0, this.table.nativeElement.width, this.table.nativeElement.height);
    this.drawScore1();
    this.drawScore2();
    this.drawBall();
    this.drawPaddle1();
    this.paddle2X = this.table.nativeElement.width - 40;
    this.drawPaddle2();
  }

  drawBall = () => {

    this.context.beginPath();
    this.context.arc(this.circleX, this.circleY, 20, 0, Math.PI * 2);
    this.context.strokeStyle = "white"
    this.context.stroke();
    this.context.fillStyle = "white"
    this.context.fill();
  }

  drawPaddle1 = () => {
    this.context.beginPath();
    this.context.rect(this.paddle1X, this.paddle1Y, 40, 200);
    this.context.strokeStyle = "white";
    this.context.stroke();
    this.context.fillStyle = "white";
    this.context.fill();
  }

  drawPaddle2 = () => {
    this.context.beginPath();
    this.context.rect(this.paddle2X, this.paddle2Y, 40, 200);
    this.context.strokeStyle = "white";
    this.context.stroke();
    this.context.fillStyle = "white";
    this.context.fill();
  }

  drawScore1 = () => {
    this.context.font = "30px Arial";
    this.context.strokeStyle = "white";
    if (this.player1Score > this.player2Score) {
      this.context.fillStyle = "white";
      this.context.fillText(this.player1Score, this.table.nativeElement.width / 4, this.table.nativeElement.height / 4);
    } else {
      this.context.strokeText(this.player1Score, this.table.nativeElement.width / 4, this.table.nativeElement.height / 4);
    }
  }

  drawScore2 = () => {
    this.context.font = "30px Arial";
    this.context.strokeStyle = "white";
    if (this.player2Score > this.player1Score) {
      this.context.fillStyle = "white";
      this.context.fillText(this.player2Score, this.table.nativeElement.width * .75, this.table.nativeElement.height / 4);
    } else {
      this.context.strokeText(this.player2Score, this.table.nativeElement.width * .75, this.table.nativeElement.height / 4);
    }
  }


  animateBall = () => {

    if (this.circleX < 21) {
      this.player2Score++;
      // document.getElementById("score").play();
      this.drawScreen();
      this.circleX = this.table.nativeElement.width / 2;
      this.circleY = this.table.nativeElement.height / 2;
    }

    if (this.circleX > this.table.nativeElement.width + 21) {
      // document.getElementById("score").play();
      this.player1Score++;
      this.drawScreen();
      this.circleX = this.table.nativeElement.width / 2;
      this.circleY = this.table.nativeElement.height / 2;
    }

    if (this.circleY + this.speedY > this.table.nativeElement.height - 20 || this.circleY + this.speedY < 20) {
      // document.getElementById("hit-wall").play();
      this.speedY = -this.speedY;
    }
    if (this.circleY > this.paddle2Y - 20 && this.circleY < this.paddle2Y + 221 && ((this.table.nativeElement.width - this.circleX <= 71) && (this.table.nativeElement.width - this.circleX >= 60))) {
      // document.getElementById("hit-sound").play();
      this.speedX = -this.speedX;
    }
    if (this.circleY > this.paddle1Y - 20 && this.circleY < this.paddle1Y + 221 && (this.circleX <= 71 && this.circleX >= 60)) {
      // document.getElementById("hit-sound").play();
      this.speedX = -this.speedX;
    }

    this.circleX += this.speedX;
    this.circleY += this.speedY;


    this.drawScreen();
    var test = requestAnimationFrame(this.animateBall)
  }



  movePaddle2 = (e) => {
    if (this.paddle2Y > 0 && e.wheelDelta > 0) {
      this.paddle2Y -= 20;
    } else if (this.paddle2Y < this.table.nativeElement.height - 220) {
      this.paddle2Y += 20;
    }
  }




}

