import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Pokemon } from '../../../../core/models/pokemon.model';

/**
 * PokemonCardComponent
 * 
 * Displays summary information for a single Pokemon with interactive hover effects.
 * Emits click events to open detail popup.
 */
@Component({
    selector: 'app-pokemon-card',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './pokemon-card.component.html',
    styleUrls: ['./pokemon-card.component.scss']
})
export class PokemonCardComponent {
    @Input() pokemon!: Pokemon;
    @Output() cardClick = new EventEmitter<number>();

    /**
     * Handle card click event
     */
    onClick(): void {
        this.cardClick.emit(this.pokemon.id);
    }

    /**
     * Handle keyboard events (Enter and Space)
     */
    onKeyDown(event: KeyboardEvent): void {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            this.cardClick.emit(this.pokemon.id);
        }
    }
}
