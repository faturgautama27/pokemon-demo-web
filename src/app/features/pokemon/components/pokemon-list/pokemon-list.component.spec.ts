import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { NgxsModule, Store } from '@ngxs/store';
import { PokemonListComponent } from './pokemon-list.component';
import { PokemonState } from '../../store/pokemon.state';
import { PokemonActions } from '../../store/pokemon.actions';
import { Pokemon } from '../../../../core/models/pokemon.model';
import { PokemonDetailResponse } from '../../../../core/models/api-response.model';
import { By } from '@angular/platform-browser';

describe('PokemonListComponent', () => {
    let component: PokemonListComponent;
    let fixture: ComponentFixture<PokemonListComponent>;
    let store: Store;
    let httpMock: HttpTestingController;
    const baseUrl = 'https://pokeapi.co/api/v2';

    const createMockPokemonDetailResponse = (id: number): PokemonDetailResponse => ({
        id,
        name: `pokemon-${id}`,
        sprites: {
            front_default: `https://example.com/${id}.png`,
            other: {
                'official-artwork': {
                    front_default: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
                }
            }
        },
        types: [
            { slot: 1, type: { name: 'grass' } },
            { slot: 2, type: { name: 'poison' } }
        ],
        weight: 69,
        height: 7,
        abilities: [
            { ability: { name: 'overgrow' }, is_hidden: false }
        ],
        moves: [
            {
                move: { name: 'tackle' },
                version_group_details: [{ move_learn_method: { name: 'level-up' } }]
            }
        ]
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                PokemonListComponent,
                NgxsModule.forRoot([PokemonState])
            ],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideAnimations(),
                provideZoneChangeDetection({ eventCoalescing: true })
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(PokemonListComponent);
        component = fixture.componentInstance;
        store = TestBed.inject(Store);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    describe('Component Initialization', () => {
        it('should create', () => {
            expect(component).toBeTruthy();
        });

        it('should dispatch LoadPage action on ngOnInit', () => {
            spyOn(store, 'dispatch');
            component.ngOnInit();
            expect(store.dispatch).toHaveBeenCalledWith(new PokemonActions.LoadPage(1));
        });

        it('should subscribe to all state selectors', () => {
            expect(component.pokemonList$).toBeDefined();
            expect(component.loading$).toBeDefined();
            expect(component.error$).toBeDefined();
            expect(component.currentPage$).toBeDefined();
            expect(component.totalPages$).toBeDefined();
            expect(component.selectedPokemon$).toBeDefined();
            expect(component.isDetailVisible$).toBeDefined();
        });
    });

    describe('Loading State', () => {
        it('should display skeleton loaders when loading is true', () => {
            fixture.detectChanges();

            // Component will be in loading state initially
            const skeletonCards = fixture.debugElement.queryAll(By.css('.skeleton-card'));
            expect(skeletonCards.length).toBe(10);

            // Clean up pending request
            const req = httpMock.expectOne(`${baseUrl}/pokemon?offset=0&limit=10`);
            req.flush({ count: 151, results: [] });
        });

        it('should display aria-live region for loading announcement', () => {
            fixture.detectChanges();

            const loadingContainer = fixture.debugElement.query(By.css('[aria-live="polite"]'));
            expect(loadingContainer).toBeTruthy();
            expect(loadingContainer.nativeElement.getAttribute('aria-label')).toBe('Loading Pokemon');

            // Clean up
            const req = httpMock.expectOne(`${baseUrl}/pokemon?offset=0&limit=10`);
            req.flush({ count: 151, results: [] });
        });

        it('should not display Pokemon cards when loading', () => {
            fixture.detectChanges();

            const pokemonCards = fixture.debugElement.queryAll(By.css('app-pokemon-card'));
            expect(pokemonCards.length).toBe(0);

            // Clean up
            const req = httpMock.expectOne(`${baseUrl}/pokemon?offset=0&limit=10`);
            req.flush({ count: 151, results: [] });
        });
    });

    describe('Pokemon Cards Display', () => {
        it('should display Pokemon cards when data loads', (done) => {
            fixture.detectChanges();

            // Mock the list response
            const listReq = httpMock.expectOne(`${baseUrl}/pokemon?offset=0&limit=10`);
            listReq.flush({
                count: 151,
                next: null,
                previous: null,
                results: [
                    { name: 'bulbasaur', url: `${baseUrl}/pokemon/1/` },
                    { name: 'ivysaur', url: `${baseUrl}/pokemon/2/` }
                ]
            });

            // Mock the detail responses
            const detail1Req = httpMock.expectOne(`${baseUrl}/pokemon/1`);
            detail1Req.flush(createMockPokemonDetailResponse(1));

            const detail2Req = httpMock.expectOne(`${baseUrl}/pokemon/2`);
            detail2Req.flush(createMockPokemonDetailResponse(2));

            setTimeout(() => {
                fixture.detectChanges();

                const pokemonCards = fixture.debugElement.queryAll(By.css('app-pokemon-card'));
                expect(pokemonCards.length).toBe(2);
                done();
            }, 100);
        });

        it('should use responsive grid classes', (done) => {
            fixture.detectChanges();

            const listReq = httpMock.expectOne(`${baseUrl}/pokemon?offset=0&limit=10`);
            listReq.flush({
                count: 151,
                results: [
                    { name: 'bulbasaur', url: `${baseUrl}/pokemon/1/` }
                ]
            });

            const detailReq = httpMock.expectOne(`${baseUrl}/pokemon/1`);
            detailReq.flush(createMockPokemonDetailResponse(1));

            setTimeout(() => {
                fixture.detectChanges();

                const gridContainer = fixture.debugElement.query(By.css('.grid'));
                expect(gridContainer).toBeTruthy();

                const styles = window.getComputedStyle(gridContainer.nativeElement);
                expect(styles.display).toBe('grid');
                expect(styles.gap).toBeTruthy();
                done();
            }, 100);
        });
    });

    describe('Pagination Display', () => {
        it('should display pagination component when data loads', (done) => {
            fixture.detectChanges();

            const listReq = httpMock.expectOne(`${baseUrl}/pokemon?offset=0&limit=10`);
            listReq.flush({
                count: 151,
                results: [{ name: 'bulbasaur', url: `${baseUrl}/pokemon/1/` }]
            });

            const detailReq = httpMock.expectOne(`${baseUrl}/pokemon/1`);
            detailReq.flush(createMockPokemonDetailResponse(1));

            setTimeout(() => {
                fixture.detectChanges();

                const pagination = fixture.debugElement.query(By.css('app-pagination'));
                expect(pagination).toBeTruthy();
                done();
            }, 100);
        });

        it('should pass correct currentPage to pagination', (done) => {
            fixture.detectChanges();

            const listReq = httpMock.expectOne(`${baseUrl}/pokemon?offset=0&limit=10`);
            listReq.flush({
                count: 151,
                results: [{ name: 'bulbasaur', url: `${baseUrl}/pokemon/1/` }]
            });

            const detailReq = httpMock.expectOne(`${baseUrl}/pokemon/1`);
            detailReq.flush(createMockPokemonDetailResponse(1));

            setTimeout(() => {
                fixture.detectChanges();

                const pagination = fixture.debugElement.query(By.css('app-pagination'));
                expect(pagination.componentInstance.currentPage).toBe(1);
                done();
            }, 100);
        });

        it('should pass correct totalPages to pagination', (done) => {
            fixture.detectChanges();

            const listReq = httpMock.expectOne(`${baseUrl}/pokemon?offset=0&limit=10`);
            listReq.flush({
                count: 151,
                results: [{ name: 'bulbasaur', url: `${baseUrl}/pokemon/1/` }]
            });

            const detailReq = httpMock.expectOne(`${baseUrl}/pokemon/1`);
            detailReq.flush(createMockPokemonDetailResponse(1));

            setTimeout(() => {
                fixture.detectChanges();

                const pagination = fixture.debugElement.query(By.css('app-pagination'));
                expect(pagination.componentInstance.totalPages).toBe(15);
                done();
            }, 100);
        });
    });

    describe('Pokemon Detail Modal', () => {
        it('should display pokemon detail component', () => {
            fixture.detectChanges();

            const detailComponent = fixture.debugElement.query(By.css('app-pokemon-detail'));
            expect(detailComponent).toBeTruthy();

            // Clean up
            const req = httpMock.expectOne(`${baseUrl}/pokemon?offset=0&limit=10`);
            req.flush({ count: 151, results: [] });
        });

        it('should pass false visible state when no pokemon selected', () => {
            fixture.detectChanges();

            const detailComponent = fixture.debugElement.query(By.css('app-pokemon-detail'));
            expect(detailComponent.componentInstance.visible).toBe(false);

            // Clean up
            const req = httpMock.expectOne(`${baseUrl}/pokemon?offset=0&limit=10`);
            req.flush({ count: 151, results: [] });
        });
    });

    describe('Action Dispatching', () => {
        it('should dispatch SelectPokemon on card click', () => {
            spyOn(store, 'dispatch');
            component.onCardClick(25);
            expect(store.dispatch).toHaveBeenCalledWith(new PokemonActions.SelectPokemon(25));
        });

        it('should dispatch DeselectPokemon on detail close', () => {
            spyOn(store, 'dispatch');
            component.onDetailClose();
            expect(store.dispatch).toHaveBeenCalledWith(new PokemonActions.DeselectPokemon());
        });

        it('should dispatch LoadPage on page change', () => {
            spyOn(store, 'dispatch');
            component.onPageChange(5);
            expect(store.dispatch).toHaveBeenCalledWith(new PokemonActions.LoadPage(5));
        });

        it('should dispatch RetryLoad on retry button click', () => {
            spyOn(store, 'dispatch');
            component.onRetry();
            expect(store.dispatch).toHaveBeenCalledWith(new PokemonActions.RetryLoad());
        });
    });

    describe('Accessibility', () => {
        it('should have proper heading structure', () => {
            fixture.detectChanges();

            const heading = fixture.debugElement.query(By.css('h1'));
            expect(heading).toBeTruthy();
            expect(heading.nativeElement.textContent.trim()).toBe('Pokémon Demo');

            // Clean up
            const req = httpMock.expectOne(`${baseUrl}/pokemon?offset=0&limit=10`);
            req.flush({ count: 151, results: [] });
        });

        it('should have role="status" on loading container', () => {
            fixture.detectChanges();

            const loadingContainer = fixture.debugElement.query(By.css('[role="status"]'));
            expect(loadingContainer).toBeTruthy();

            // Clean up
            const req = httpMock.expectOne(`${baseUrl}/pokemon?offset=0&limit=10`);
            req.flush({ count: 151, results: [] });
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty pokemon list', () => {
            fixture.detectChanges();

            // Initially no cards should be displayed (loading state)
            const pokemonCards = fixture.debugElement.queryAll(By.css('app-pokemon-card'));
            expect(pokemonCards.length).toBe(0);

            // Clean up
            const req = httpMock.expectOne(`${baseUrl}/pokemon?offset=0&limit=10`);
            req.flush({ count: 151, results: [] });
        });

        it('should handle null selected pokemon', () => {
            fixture.detectChanges();

            const detailComponent = fixture.debugElement.query(By.css('app-pokemon-detail'));
            expect(detailComponent.componentInstance.pokemon).toBeNull();

            // Clean up
            const req = httpMock.expectOne(`${baseUrl}/pokemon?offset=0&limit=10`);
            req.flush({ count: 151, results: [] });
        });
    });
});
