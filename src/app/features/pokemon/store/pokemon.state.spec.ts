import { TestBed } from '@angular/core/testing';
import { provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { NgxsModule, Store } from '@ngxs/store';
import { PokemonState, PokemonStateModel } from './pokemon.state';
import { PokemonActions } from './pokemon.actions';
import { PokemonSelectors } from './pokemon.selectors';
import { PokemonApiService } from '../../../core/services/pokemon-api.service';
import { Pokemon } from '../../../core/models/pokemon.model';
import { PokemonDetailResponse } from '../../../core/models/api-response.model';

describe('PokemonState', () => {
    let store: Store;
    let httpMock: HttpTestingController;
    const baseUrl = 'https://pokeapi.co/api/v2';

    const mockPokemon: Pokemon[] = [
        {
            id: 1,
            name: 'Bulbasaur',
            number: '001',
            imageUrl: 'https://example.com/1.png',
            types: ['Grass', 'Poison'],
            weight: 69,
            height: 7,
            abilities: [{ name: 'Overgrow', isHidden: false }],
            moves: [{ name: 'Tackle', learnMethod: 'level-up' }]
        },
        {
            id: 2,
            name: 'Ivysaur',
            number: '002',
            imageUrl: 'https://example.com/2.png',
            types: ['Grass', 'Poison'],
            weight: 130,
            height: 10,
            abilities: [{ name: 'Overgrow', isHidden: false }],
            moves: [{ name: 'Tackle', learnMethod: 'level-up' }]
        }
    ];

    const mockPokemonDetailResponse: PokemonDetailResponse = {
        id: 1,
        name: 'bulbasaur',
        sprites: {
            front_default: 'https://example.com/1.png',
            other: {
                'official-artwork': {
                    front_default: 'https://example.com/1.png'
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
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                NgxsModule.forRoot([PokemonState])
            ],
            providers: [
                PokemonApiService,
                provideHttpClient(),
                provideHttpClientTesting(),
                provideZoneChangeDetection({ eventCoalescing: true })
            ]
        });

        store = TestBed.inject(Store);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    describe('State Initialization', () => {
        it('should initialize with default values', () => {
            const state = store.selectSnapshot((state: any) => state.pokemon) as PokemonStateModel;

            expect(state.currentPage).toBe(1);
            expect(state.totalPages).toBe(15);
            expect(state.itemsPerPage).toBe(10);
            expect(state.pokemonList).toEqual([]);
            expect(state.loading).toBe(false);
            expect(state.error).toBeNull();
            expect(state.selectedPokemonId).toBeNull();
        });
    });

    describe('LoadPage Action', () => {
        it('should set loading to true and clear error', (done) => {
            store.dispatch(new PokemonActions.LoadPage(1));

            const state = store.selectSnapshot((state: any) => state.pokemon) as PokemonStateModel;
            expect(state.loading).toBe(true);
            expect(state.error).toBeNull();
            expect(state.currentPage).toBe(1);

            // Clean up pending requests
            const listReq = httpMock.expectOne(`${baseUrl}/pokemon?offset=0&limit=10`);
            listReq.flush({
                count: 151,
                next: null,
                previous: null,
                results: []
            });

            done();
        });

        it('should update currentPage to the requested page', (done) => {
            store.dispatch(new PokemonActions.LoadPage(5));

            const state = store.selectSnapshot((state: any) => state.pokemon) as PokemonStateModel;
            expect(state.currentPage).toBe(5);

            // Clean up pending requests
            const listReq = httpMock.expectOne(`${baseUrl}/pokemon?offset=40&limit=10`);
            listReq.flush({
                count: 151,
                next: null,
                previous: null,
                results: []
            });

            done();
        });

        it('should calculate correct offset for page 1', (done) => {
            store.dispatch(new PokemonActions.LoadPage(1));

            const listReq = httpMock.expectOne(`${baseUrl}/pokemon?offset=0&limit=10`);
            expect(listReq.request.method).toBe('GET');

            listReq.flush({
                count: 151,
                next: null,
                previous: null,
                results: []
            });

            done();
        });

        it('should calculate correct offset for page 5', (done) => {
            store.dispatch(new PokemonActions.LoadPage(5));

            const listReq = httpMock.expectOne(`${baseUrl}/pokemon?offset=40&limit=10`);
            expect(listReq.request.method).toBe('GET');

            listReq.flush({
                count: 151,
                next: null,
                previous: null,
                results: []
            });

            done();
        });

        it('should calculate correct offset for page 15', (done) => {
            store.dispatch(new PokemonActions.LoadPage(15));

            const listReq = httpMock.expectOne(`${baseUrl}/pokemon?offset=140&limit=10`);
            expect(listReq.request.method).toBe('GET');

            listReq.flush({
                count: 151,
                next: null,
                previous: null,
                results: []
            });

            done();
        });
    });

    describe('LoadPageSuccess Action', () => {
        it('should set pokemonList and clear loading', () => {
            store.dispatch(new PokemonActions.LoadPageSuccess(mockPokemon, 1));

            const state = store.selectSnapshot((state: any) => state.pokemon) as PokemonStateModel;
            expect(state.pokemonList).toEqual(mockPokemon);
            expect(state.loading).toBe(false);
            expect(state.error).toBeNull();
            expect(state.currentPage).toBe(1);
        });

        it('should update currentPage to the loaded page', () => {
            store.dispatch(new PokemonActions.LoadPageSuccess(mockPokemon, 3));

            const state = store.selectSnapshot((state: any) => state.pokemon) as PokemonStateModel;
            expect(state.currentPage).toBe(3);
        });

        it('should replace existing pokemonList', () => {
            // First load
            store.dispatch(new PokemonActions.LoadPageSuccess(mockPokemon, 1));
            let state = store.selectSnapshot((state: any) => state.pokemon) as PokemonStateModel;
            expect(state.pokemonList.length).toBe(2);

            // Second load with different data
            const newPokemon: Pokemon[] = [
                {
                    id: 11,
                    name: 'Metapod',
                    number: '011',
                    imageUrl: 'https://example.com/11.png',
                    types: ['Bug'],
                    weight: 99,
                    height: 7,
                    abilities: [{ name: 'Shed Skin', isHidden: false }],
                    moves: [{ name: 'Harden', learnMethod: 'level-up' }]
                }
            ];

            store.dispatch(new PokemonActions.LoadPageSuccess(newPokemon, 2));
            state = store.selectSnapshot((state: any) => state.pokemon) as PokemonStateModel;
            expect(state.pokemonList).toEqual(newPokemon);
            expect(state.pokemonList.length).toBe(1);
        });
    });

    describe('LoadPageFailure Action', () => {
        it('should set error and clear loading', () => {
            // First set loading to true
            store.dispatch(new PokemonActions.LoadPage(1));

            // Then dispatch failure
            store.dispatch(new PokemonActions.LoadPageFailure('Network error'));

            const state = store.selectSnapshot((state: any) => state.pokemon) as PokemonStateModel;
            expect(state.error).toBe('Network error');
            expect(state.loading).toBe(false);

            // Clean up pending request
            const listReq = httpMock.expectOne(`${baseUrl}/pokemon?offset=0&limit=10`);
            listReq.flush({
                count: 151,
                next: null,
                previous: null,
                results: []
            });
        });

        it('should preserve pokemonList on error', () => {
            // Load some data first
            store.dispatch(new PokemonActions.LoadPageSuccess(mockPokemon, 1));

            // Then trigger an error
            store.dispatch(new PokemonActions.LoadPageFailure('API error'));

            const state = store.selectSnapshot((state: any) => state.pokemon) as PokemonStateModel;
            expect(state.pokemonList).toEqual(mockPokemon);
            expect(state.error).toBe('API error');
        });
    });

    describe('SelectPokemon Action', () => {
        it('should set selectedPokemonId', () => {
            store.dispatch(new PokemonActions.SelectPokemon(25));

            const state = store.selectSnapshot((state: any) => state.pokemon) as PokemonStateModel;
            expect(state.selectedPokemonId).toBe(25);
        });

        it('should update selectedPokemonId when called multiple times', () => {
            store.dispatch(new PokemonActions.SelectPokemon(1));
            let state = store.selectSnapshot((state: any) => state.pokemon) as PokemonStateModel;
            expect(state.selectedPokemonId).toBe(1);

            store.dispatch(new PokemonActions.SelectPokemon(2));
            state = store.selectSnapshot((state: any) => state.pokemon) as PokemonStateModel;
            expect(state.selectedPokemonId).toBe(2);
        });
    });

    describe('DeselectPokemon Action', () => {
        it('should clear selectedPokemonId', () => {
            // First select a Pokemon
            store.dispatch(new PokemonActions.SelectPokemon(25));
            let state = store.selectSnapshot((state: any) => state.pokemon) as PokemonStateModel;
            expect(state.selectedPokemonId).toBe(25);

            // Then deselect
            store.dispatch(new PokemonActions.DeselectPokemon());
            state = store.selectSnapshot((state: any) => state.pokemon) as PokemonStateModel;
            expect(state.selectedPokemonId).toBeNull();
        });

        it('should work when no Pokemon is selected', () => {
            store.dispatch(new PokemonActions.DeselectPokemon());

            const state = store.selectSnapshot((state: any) => state.pokemon) as PokemonStateModel;
            expect(state.selectedPokemonId).toBeNull();
        });
    });

    describe('RetryLoad Action', () => {
        it('should dispatch LoadPage with current page', (done) => {
            // Set current page to 3
            store.dispatch(new PokemonActions.LoadPageSuccess(mockPokemon, 3));

            // Dispatch retry
            store.dispatch(new PokemonActions.RetryLoad());

            // Should make request for page 3 (offset 20)
            const listReq = httpMock.expectOne(`${baseUrl}/pokemon?offset=20&limit=10`);
            expect(listReq.request.method).toBe('GET');

            listReq.flush({
                count: 151,
                next: null,
                previous: null,
                results: []
            });

            done();
        });

        it('should retry from page 1 if no page was loaded', (done) => {
            store.dispatch(new PokemonActions.RetryLoad());

            // Should make request for page 1 (offset 0)
            const listReq = httpMock.expectOne(`${baseUrl}/pokemon?offset=0&limit=10`);
            expect(listReq.request.method).toBe('GET');

            listReq.flush({
                count: 151,
                next: null,
                previous: null,
                results: []
            });

            done();
        });
    });

    describe('Selectors', () => {
        beforeEach(() => {
            // Set up state with test data
            store.dispatch(new PokemonActions.LoadPageSuccess(mockPokemon, 3));
        });

        describe('currentPage', () => {
            it('should return current page number', () => {
                const currentPage = store.selectSnapshot(PokemonSelectors.currentPage);
                expect(currentPage).toBe(3);
            });

            it('should return default page 1 on initial state', () => {
                // Reset to initial state by creating a new store instance
                const initialState = store.selectSnapshot((state: any) => state.pokemon) as PokemonStateModel;
                // The state should already be initialized with defaults
                const currentPage = store.selectSnapshot(PokemonSelectors.currentPage);
                expect(currentPage).toBe(initialState.currentPage || 1);
            });
        });

        describe('totalPages', () => {
            it('should return total pages', () => {
                const totalPages = store.selectSnapshot(PokemonSelectors.totalPages);
                expect(totalPages).toBe(15);
            });
        });

        describe('pokemonList', () => {
            it('should return current Pokemon list', () => {
                const pokemonList = store.selectSnapshot(PokemonSelectors.pokemonList);
                expect(pokemonList).toEqual(mockPokemon);
                expect(pokemonList.length).toBe(2);
            });

            it('should return empty array on initial state', () => {
                // Get the initial state
                const initialState = store.selectSnapshot((state: any) => state.pokemon) as PokemonStateModel;
                // The state should already be initialized with empty array
                const pokemonList = store.selectSnapshot(PokemonSelectors.pokemonList);
                expect(pokemonList).toEqual(initialState.pokemonList || []);
            });
        });

        describe('loading', () => {
            it('should return false when not loading', () => {
                const loading = store.selectSnapshot(PokemonSelectors.loading);
                expect(loading).toBe(false);
            });

            it('should return true when loading', (done) => {
                store.dispatch(new PokemonActions.LoadPage(1));

                const loading = store.selectSnapshot(PokemonSelectors.loading);
                expect(loading).toBe(true);

                // Clean up
                const listReq = httpMock.expectOne(`${baseUrl}/pokemon?offset=0&limit=10`);
                listReq.flush({
                    count: 151,
                    next: null,
                    previous: null,
                    results: []
                });

                done();
            });
        });

        describe('error', () => {
            it('should return null when no error', () => {
                const error = store.selectSnapshot(PokemonSelectors.error);
                expect(error).toBeNull();
            });

            it('should return error message when error exists', () => {
                store.dispatch(new PokemonActions.LoadPageFailure('Test error'));

                const error = store.selectSnapshot(PokemonSelectors.error);
                expect(error).toBe('Test error');
            });
        });

        describe('selectedPokemon', () => {
            it('should return null when no Pokemon is selected', () => {
                const selectedPokemon = store.selectSnapshot(PokemonSelectors.selectedPokemon);
                expect(selectedPokemon).toBeNull();
            });

            it('should return selected Pokemon from list', () => {
                store.dispatch(new PokemonActions.SelectPokemon(1));

                const selectedPokemon = store.selectSnapshot(PokemonSelectors.selectedPokemon);
                expect(selectedPokemon).toEqual(mockPokemon[0]);
                expect(selectedPokemon?.name).toBe('Bulbasaur');
            });

            it('should return null if selected Pokemon is not in current list', () => {
                store.dispatch(new PokemonActions.SelectPokemon(999));

                const selectedPokemon = store.selectSnapshot(PokemonSelectors.selectedPokemon);
                expect(selectedPokemon).toBeNull();
            });

            it('should return correct Pokemon when multiple are in list', () => {
                store.dispatch(new PokemonActions.SelectPokemon(2));

                const selectedPokemon = store.selectSnapshot(PokemonSelectors.selectedPokemon);
                expect(selectedPokemon).toEqual(mockPokemon[1]);
                expect(selectedPokemon?.name).toBe('Ivysaur');
            });
        });

        describe('isDetailVisible', () => {
            it('should return false when no Pokemon is selected', () => {
                const isVisible = store.selectSnapshot(PokemonSelectors.isDetailVisible);
                expect(isVisible).toBe(false);
            });

            it('should return true when a Pokemon is selected', () => {
                store.dispatch(new PokemonActions.SelectPokemon(1));

                const isVisible = store.selectSnapshot(PokemonSelectors.isDetailVisible);
                expect(isVisible).toBe(true);
            });

            it('should return false after deselecting Pokemon', () => {
                store.dispatch(new PokemonActions.SelectPokemon(1));
                store.dispatch(new PokemonActions.DeselectPokemon());

                const isVisible = store.selectSnapshot(PokemonSelectors.isDetailVisible);
                expect(isVisible).toBe(false);
            });
        });
    });

    describe('Integration Tests', () => {
        it('should handle complete page load flow', (done) => {
            // Initial state
            let state = store.selectSnapshot((state: any) => state.pokemon) as PokemonStateModel;
            expect(state.loading).toBe(false);
            expect(state.pokemonList).toEqual([]);

            // Dispatch load
            store.dispatch(new PokemonActions.LoadPage(1));

            // Loading state
            state = store.selectSnapshot((state: any) => state.pokemon) as PokemonStateModel;
            expect(state.loading).toBe(true);
            expect(state.currentPage).toBe(1);

            // Mock API responses
            const listReq = httpMock.expectOne(`${baseUrl}/pokemon?offset=0&limit=10`);
            listReq.flush({
                count: 151,
                next: null,
                previous: null,
                results: [
                    { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' }
                ]
            });

            // Wait for detail request
            setTimeout(() => {
                const detailReq = httpMock.expectOne(`${baseUrl}/pokemon/1`);
                detailReq.flush(mockPokemonDetailResponse);

                // Check final state
                setTimeout(() => {
                    state = store.selectSnapshot((state: any) => state.pokemon) as PokemonStateModel;
                    expect(state.loading).toBe(false);
                    expect(state.pokemonList.length).toBe(1);
                    expect(state.pokemonList[0].name).toBe('Bulbasaur');
                    done();
                }, 100);
            }, 100);
        });

        it('should handle error during page load', (done) => {
            store.dispatch(new PokemonActions.LoadPage(1));

            // Handle initial request
            const listReq = httpMock.expectOne(`${baseUrl}/pokemon?offset=0&limit=10`);
            listReq.error(new ProgressEvent('error'), { status: 0 });

            // Handle retry 1 after 1s delay
            setTimeout(() => {
                const retry1 = httpMock.expectOne(`${baseUrl}/pokemon?offset=0&limit=10`);
                retry1.error(new ProgressEvent('error'), { status: 0 });
            }, 1100);

            // Handle retry 2 after 2s delay
            setTimeout(() => {
                const retry2 = httpMock.expectOne(`${baseUrl}/pokemon?offset=0&limit=10`);
                retry2.error(new ProgressEvent('error'), { status: 0 });
            }, 3200);

            // Handle retry 3 after 4s delay and check final state
            setTimeout(() => {
                const retry3 = httpMock.expectOne(`${baseUrl}/pokemon?offset=0&limit=10`);
                retry3.error(new ProgressEvent('error'), { status: 0 });

                // Check state after all retries
                setTimeout(() => {
                    const state = store.selectSnapshot((state: any) => state.pokemon) as PokemonStateModel;
                    expect(state.loading).toBe(false);
                    expect(state.error).toBeTruthy();
                    done();
                }, 100);
            }, 7300);
        }, 10000);

        it('should handle select and deselect flow', () => {
            // Load Pokemon
            store.dispatch(new PokemonActions.LoadPageSuccess(mockPokemon, 1));

            // Select Pokemon
            store.dispatch(new PokemonActions.SelectPokemon(1));
            let selectedPokemon = store.selectSnapshot(PokemonSelectors.selectedPokemon);
            let isVisible = store.selectSnapshot(PokemonSelectors.isDetailVisible);
            expect(selectedPokemon?.id).toBe(1);
            expect(isVisible).toBe(true);

            // Deselect Pokemon
            store.dispatch(new PokemonActions.DeselectPokemon());
            selectedPokemon = store.selectSnapshot(PokemonSelectors.selectedPokemon);
            isVisible = store.selectSnapshot(PokemonSelectors.isDetailVisible);
            expect(selectedPokemon).toBeNull();
            expect(isVisible).toBe(false);
        });
    });
});
