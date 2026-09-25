import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-ementa',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ementa.component.html',
  styleUrls: ['./ementa.component.css']
})
export class EmentaComponent {
  modulos = [
    {
      titulo: 'Módulo 1',
      disciplinas: [
        'Introdução à Teologia',
        'Bibliologia',
        'Hermenêutica',
        'Teontologia',
        'Cristologia',
        'Pneumatologia',
        'Antropologia',
        'Angeologia',
        'Geografia Bíblica',
        'História da Igreja'
      ]
    },
    {
      titulo: 'Módulo 2',
      disciplinas: [
        'Hamartiologia',
        'Soteriologia',
        'Eclesiologia',
        'Pentateuco',
        'Livros Históricos',
        'Livros Poéticos',
        'Profetas Maiores',
        'Profetas Menores',
        'Daniel e Apocalipse',
        'Ética Cristã'
      ]
    },
    {
      titulo: 'Módulo 3',
      disciplinas: [
        'Evangelhos',
        'Atos dos Apóstolos',
        'Epístolas Paulinas',
        'Epístolas Gerais',
        'Homilética',
        'História das Assembleias de Deus',
        'Evangelismo e Discipulado',
        'Educação Cristã',
        'Escatologia',
        'Heresiologia'
      ]
    }
  ];
}
