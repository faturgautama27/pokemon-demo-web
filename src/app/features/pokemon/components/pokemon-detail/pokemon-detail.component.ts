import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { LucideAngularModule, X } from 'lucide-angular';
import { Pokemon } from '../../../../core/models/pokemon.model';

/**
 * PokemonDetailComponent
 * 
 * Modal dialog displaying comprehensive Pokemon information.
 * Shows abilities, moves, and all basic stats in a scrollable container.
 */
@Component({
    selector: 'app-pokemon-detail',
    standalone: true,
    imports: [CommonModule, DialogModule, LucideAngularModule],
    templateUrl: './pokemon-detail.component.html',
    styleUrls: ['./pokemon-detail.component.scss']
})
export class PokemonDetailComponent {
    @Input() pokemon: Pokemon | null = null;
    @Input() visible: boolean = false;
    @Output() close = new EventEmitter<void>();

    // Lucide icons
    readonly X = X;

    /**
     * Handle modal close event
     */
    onClose(): void {
        this.close.emit();
    }

    /**
     * Handle dialog hide event (backdrop click, ESC key)
     */
    onHide(): void {
        this.close.emit();
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
