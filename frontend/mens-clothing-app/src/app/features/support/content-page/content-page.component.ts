import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Data, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

type PageSection = {
  heading: string;
  body: string[];
};

type PageCallToAction = {
  label: string;
  link: string;
};

@Component({
  selector: 'app-content-page',
  standalone: true,
  imports: [CommonModule, NgFor, NgIf, RouterLink, MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './content-page.component.html',
  styleUrl: './content-page.component.scss'
})
export class ContentPageComponent implements OnInit {
  title = '';
  subtitle = '';
  highlights: string[] = [];
  sections: PageSection[] = [];
  cta?: PageCallToAction;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.data.subscribe((data: Data) => {
      this.title = data['title'] ?? '';
      this.subtitle = data['subtitle'] ?? '';
      this.highlights = data['highlights'] ?? [];
      this.sections = data['sections'] ?? [];
      this.cta = data['cta'];
    });
  }
}
