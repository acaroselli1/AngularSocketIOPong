import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import io from "socket.io-client";


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
      this.socket.emit('paddle1Up', this.paddle1Y)
    }
    else if (event.keyCode === 90 && this.paddle1Y < this.table.nativeElement.height - 220) {
      this.socket.emit('paddle1Down', this.paddle1Y)
    }
  }

  paddle1X = 0;
  left = true;
  player1Score = 0;
  player2Score = 0;
  speedX = 10;
  speedY = 2;
  circleX=500;
  circleY=500;
  paddle1Y;
  paddle2X;
  paddle2Y;

  private context;
  private socket;

  // establish connnection to socket server
  ngOnInit() {

    window.addEventListener('mousewheel', this.movePaddle2);

    window.addEventListener('onresize', this.drawScreen);

    this.socket = io("http://localhost:3000")
  }

  ngAfterViewInit() {

    this.context = this.table.nativeElement.getContext('2d');
    this.circleX = this.table.nativeElement.width / 2;
    this.circleY = this.table.nativeElement.height / 2;
    this.paddle1Y = this.table.nativeElement.height / 2 - 100;
    this.paddle2X = this.table.nativeElement.width - 40;
    this.paddle2Y = this.table.nativeElement.height / 2 - 100;

    this.socket.emit('start', { paddle1Y: this.paddle1Y, paddle2Y: this.paddle2Y })

    this.socket.on('updatePaddlePositions', (updatedPositions) => {
      this.paddle1Y = updatedPositions.paddle1Y;
      this.paddle2Y = updatedPositions.paddle2Y;
    })

    this.socket.on('updateBallPosition', (updatedBallPosition) => {
      this.circleX = updatedBallPosition.circleX;
      this.circleY = updatedBallPosition.circleY;
    })

    this.socket.on('updateBallSpeed', (updatedBallSpeed) => {
      this.speedX = updatedBallSpeed.speedX;
      this.speedY = updatedBallSpeed.speedY;
    })

    this.socket.on('startGame', () => this.beginGame())
   
  }

  drawScreen = () => {
    this.table.nativeElement.height = 500
    this.table.nativeElement.width = 500;
    this.context.clearRect(0, 0, 500, 500);
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

    if (this.circleX < 20) {
      this.player2Score++;
      // document.getElementById("score").play();
      this.drawScreen();
      this.circleX = this.table.nativeElement.width / 2;
      this.circleY = this.table.nativeElement.height / 2;
    }

    if (this.circleX > this.table.nativeElement.width + 20) {
      // document.getElementById("score").play();
      this.player1Score++;
      this.drawScreen();
      this.circleX = this.table.nativeElement.width / 2;
      this.circleY = this.table.nativeElement.height / 2;
    }

    if (this.circleY + this.speedY > this.table.nativeElement.height - 20 || this.circleY + this.speedY < 20){
      // document.getElementById("hit-wall").play();
      this.socket.emit('hitWall');
    }

    if ((((this.circleX + this.speedX > this.table.nativeElement.width - 60) && ((this.circleY >= this.paddle2Y) && (this.circleY <= this.paddle2Y + 200))) || ((this.circleX + this.speedX < 60) && ((this.circleY >= this.paddle1Y) && (this.circleY <= this.paddle1Y + 200)))) && !(this.circleX < 60 || (this.circleX > this.table.nativeElement.width - 60 ))) {
      // document.getElementById("hit-wall").play();
      this.socket.emit('hitPaddle')
    }

    this.circleX += this.speedX;
    this.circleY += this.speedY;


    this.drawScreen();
    var test = requestAnimationFrame(this.animateBall)
  }

  movePaddle2 = (e) => {
    if (this.paddle2Y > 0 && e.wheelDelta > 0) {
      this.socket.emit('paddle2Up')
    } else if (this.paddle2Y < this.table.nativeElement.height - 220) {
      this.socket.emit('paddle2Down')
    }
  }

  handlePlayer1Click() {
    this.socket.emit('player1ready', true);
  }

  handlePlayer2Click() {
    this.socket.emit('player2ready', true);
  }


  beginGame() {
    this.animateBall();
    this.drawBall();
  }

}

