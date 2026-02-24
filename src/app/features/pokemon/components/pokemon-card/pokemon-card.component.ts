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

    /**
     * Get Tailwind background color class for Pokemon type
     */
    getTypeColorClass(type: string): string {
        const typeColors: { [key: string]: string } = {
            'normal': 'bg-gray-400',
            'fire': 'bg-red-500',
            'water': 'bg-blue-500',
            'grass': 'bg-green-500',
            'electric': 'bg-yellow-400',
            'ice': 'bg-cyan-300',
            'fighting': 'bg-red-700',
            'poison': 'bg-purple-500',
            'ground': 'bg-yellow-600',
            'flying': 'bg-indigo-400',
            'psychic': 'bg-pink-500',
            'bug': 'bg-lime-500',
            'rock': 'bg-yellow-800',
            'ghost': 'bg-purple-700',
            'dragon': 'bg-indigo-700',
            'dark': 'bg-gray-800',
            'steel': 'bg-gray-500',
            'fairy': 'bg-pink-300'
        };
        return typeColors[type.toLowerCase()] || 'bg-gray-400';
    }
}
