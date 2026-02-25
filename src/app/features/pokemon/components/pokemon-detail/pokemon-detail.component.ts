import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { LucideAngularModule, X } from 'lucide-angular';
import { Store } from '@ngxs/store';
import { PokemonSelectors } from '../../store/pokemon.selectors';

/**
 * PokemonDetailComponent
 * 
 * Pokedex-style modal dialog displaying Pokemon information.
 * Shows detailed Pokemon data with modern, eye-catching design.
 */
@Component({
    selector: 'app-pokemon-detail',
    standalone: true,
    imports: [CommonModule, DialogModule, LucideAngularModule],
    templateUrl: './pokemon-detail.component.html',
    styleUrls: ['./pokemon-detail.component.scss']
})
export class PokemonDetailComponent {
    @Input() visible: boolean = false;
    @Output() close = new EventEmitter<void>();

    store = inject(Store);
    pokemon = this.store.select(PokemonSelectors.selectedPokemon);

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
}
