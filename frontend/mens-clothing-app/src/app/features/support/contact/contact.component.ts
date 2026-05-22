import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

type ContactMethod = {
  icon: string;
  title: string;
  value: string;
  description: string;
};

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, NgFor, NgIf, FormsModule, RouterLink, MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent {
  name = '';
  email = '';
  message = '';
  submitted = false;

  readonly contactMethods: ContactMethod[] = [
    {
      icon: 'call',
      title: 'Call Us',
      value: '+1 (555) 000-1234',
      description: 'Available Monday to Saturday from 9 AM to 7 PM.'
    },
    {
      icon: 'mail',
      title: 'Email Us',
      value: 'hello@mensclothing.com',
      description: 'We reply to all support questions within one business day.'
    },
    {
      icon: 'location_on',
      title: 'Visit Our Studio',
      value: '123 Fashion Ave, New York, NY 10001',
      description: 'Drop by to explore new arrivals and sizing help in person.'
    }
  ];

  submitForm(): void {
    this.submitted = true;
  }
}
