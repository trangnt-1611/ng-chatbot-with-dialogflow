import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

const dialogflowURL = `${environment.CLOUD_FUNCTION_URL}/dialogflowGateway`;

type MessageType = {
  text: string,
  sender: string,
  avatar?: any,
  reply?: any,
  date: Date,
}

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent implements OnInit {

  messages: MessageType[] = [];
  loading = false;
  
  // Random ID to maintain session with server
  sessionId = Math.random().toString(36).slice(-5);

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.addBotMessage('Human presence detected 🤖. How can I help you? ');
  }

  handleUserMessage(event: any) {
    console.log(event);
    const text = event.message;
    this.addUserMessage(text);

    this.loading = true;

    // Make the request 
    this.http.post<any>(
      dialogflowURL,
      {
        sessionId: this.sessionId,
        queryInput: {
          text: {
            text,
            languageCode: 'en-US'
          }
        }
      }
    )
    .subscribe(res => {
      const { fulfillmentText } = res;
      this.addBotMessage(fulfillmentText);
      this.loading = false;
    });
  }

  addUserMessage(text: string) {
    this.messages.push({
      text,
      sender: 'You',
      reply: true,
      date: new Date()
    });
  }

  addBotMessage(text: string) {
    this.messages.push({
      text,
      sender: 'Bot',
      avatar: '/assets/bot.jpeg',
      date: new Date()
    });
  }

}