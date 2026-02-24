import { provideZoneChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PokemonApiService } from './pokemon-api.service';
import { PokemonDetailResponse } from '../models/api-response.model';

describe('PokemonApiService', () => {
    let service: PokemonApiService;
    let httpMock: HttpTestingController;
    const baseUrl = 'https://pokeapi.co/api/v2';

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                PokemonApiService,
                provideHttpClient(),
                provideHttpClientTesting(),
                provideZoneChangeDetection({ eventCoalescing: true })
            ]
        });
        service = TestBed.inject(PokemonApiService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    describe('getPokemonList', () => {
        it('should fetch Pokemon list successfully', (done) => {
            const mockResponse = {
                count: 151,
                next: 'https://pokeapi.co/api/v2/pokemon?offset=10&limit=10',
                previous: null,
                results: [
                    { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
                    { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon/2/' }
                ]
            };

            service.getPokemonList(0, 10).subscribe(results => {
                expect(results.length).toBe(2);
                expect(results[0].name).toBe('bulbasaur');
                expect(results[1].name).toBe('ivysaur');
                done();
            });

            const req = httpMock.expectOne(`${baseUrl}/pokemon?offset=0&limit=10`);
            expect(req.request.method).toBe('GET');
            req.flush(mockResponse);
        });

        it('should handle 404 error', (done) => {
            service.getPokemonList(0, 10).subscribe({
                next: () => fail('should have failed'),
                error: (error) => {
                    expect(error.message).toBe('Pokemon not found');
                    done();
                }
            });

            // Handle initial request
            const req1 = httpMock.expectOne(`${baseUrl}/pokemon?offset=0&limit=10`);
            req1.flush('Not found', { status: 404, statusText: 'Not Found' });

            // Handle retry 1 after 1s delay
            setTimeout(() => {
                const req2 = httpMock.expectOne(`${baseUrl}/pokemon?offset=0&limit=10`);
                req2.flush('Not found', { status: 404, statusText: 'Not Found' });
            }, 1100);

            // Handle retry 2 after 2s delay
            setTimeout(() => {
                const req3 = httpMock.expectOne(`${baseUrl}/pokemon?offset=0&limit=10`);
                req3.flush('Not found', { status: 404, statusText: 'Not Found' });
            }, 3200);

            // Handle retry 3 after 4s delay
            setTimeout(() => {
                const req4 = httpMock.expectOne(`${baseUrl}/pokemon?offset=0&limit=10`);
                req4.flush('Not found', { status: 404, statusText: 'Not Found' });
            }, 7300);
        }, 10000);

        it('should handle 429 rate limit error', (done) => {
            service.getPokemonList(0, 10).subscribe({
                next: () => fail('should have failed'),
                error: (error) => {
                    expect(error.message).toBe('Too many requests. Please try again in a moment.');
                    done();
                }
            });

            // Handle initial request
            const req1 = httpMock.expectOne(`${baseUrl}/pokemon?offset=0&limit=10`);
            req1.flush('Too many requests', { status: 429, statusText: 'Too Many Requests' });

            // Handle retry 1 after 1s delay
            setTimeout(() => {
                const req2 = httpMock.expectOne(`${baseUrl}/pokemon?offset=0&limit=10`);
                req2.flush('Too many requests', { status: 429, statusText: 'Too Many Requests' });
            }, 1100);

            // Handle retry 2 after 2s delay
            setTimeout(() => {
                const req3 = httpMock.expectOne(`${baseUrl}/pokemon?offset=0&limit=10`);
                req3.flush('Too many requests', { status: 429, statusText: 'Too Many Requests' });
            }, 3200);

            // Handle retry 3 after 4s delay
            setTimeout(() => {
                const req4 = httpMock.expectOne(`${baseUrl}/pokemon?offset=0&limit=10`);
                req4.flush('Too many requests', { status: 429, statusText: 'Too Many Requests' });
            }, 7300);
        }, 10000);

        it('should handle 500 server error', (done) => {
            service.getPokemonList(0, 10).subscribe({
                next: () => fail('should have failed'),
                error: (error) => {
                    expect(error.message).toBe('Service temporarily unavailable. Please try again.');
                    done();
                }
            });

            // Handle initial request
            const req1 = httpMock.expectOne(`${baseUrl}/pokemon?offset=0&limit=10`);
            req1.flush('Server error', { status: 500, statusText: 'Internal Server Error' });

            // Handle retry 1 after 1s delay
            setTimeout(() => {
                const req2 = httpMock.expectOne(`${baseUrl}/pokemon?offset=0&limit=10`);
                req2.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
            }, 1100);

            // Handle retry 2 after 2s delay
            setTimeout(() => {
                const req3 = httpMock.expectOne(`${baseUrl}/pokemon?offset=0&limit=10`);
                req3.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
            }, 3200);

            // Handle retry 3 after 4s delay
            setTimeout(() => {
                const req4 = httpMock.expectOne(`${baseUrl}/pokemon?offset=0&limit=10`);
                req4.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
            }, 7300);
        }, 10000);

        it('should handle network timeout error', (done) => {
            service.getPokemonList(0, 10).subscribe({
                next: () => fail('should have failed'),
                error: (error) => {
                    expect(error.message).toBe('Unable to connect. Please check your internet connection.');
                    done();
                }
            });

            // Handle initial request
            const req1 = httpMock.expectOne(`${baseUrl}/pokemon?offset=0&limit=10`);
            req1.error(new ProgressEvent('error'), { status: 0 });

            // Handle retry 1 after 1s delay
            setTimeout(() => {
                const req2 = httpMock.expectOne(`${baseUrl}/pokemon?offset=0&limit=10`);
                req2.error(new ProgressEvent('error'), { status: 0 });
            }, 1100);

            // Handle retry 2 after 2s delay
            setTimeout(() => {
                const req3 = httpMock.expectOne(`${baseUrl}/pokemon?offset=0&limit=10`);
                req3.error(new ProgressEvent('error'), { status: 0 });
            }, 3200);

            // Handle retry 3 after 4s delay
            setTimeout(() => {
                const req4 = httpMock.expectOne(`${baseUrl}/pokemon?offset=0&limit=10`);
                req4.error(new ProgressEvent('error'), { status: 0 });
            }, 7300);
        }, 10000);
    });

    describe('getPokemonDetail', () => {
        const mockPokemonResponse: PokemonDetailResponse = {
            id: 1,
            name: 'bulbasaur',
            sprites: {
                front_default: 'https://example.com/bulbasaur.png',
                other: {
                    'official-artwork': {
                        front_default: 'https://example.com/bulbasaur-artwork.png'
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
                { ability: { name: 'overgrow' }, is_hidden: false },
                { ability: { name: 'chlorophyll' }, is_hidden: true }
            ],
            moves: [
                {
                    move: { name: 'tackle' },
                    version_group_details: [{ move_learn_method: { name: 'level-up' } }]
                }
            ]
        };

        it('should fetch and transform Pokemon detail successfully', (done) => {
            service.getPokemonDetail(1).subscribe(pokemon => {
                expect(pokemon).toBeDefined();
                expect(pokemon.id).toBe(1);
                expect(pokemon.name).toBe('Bulbasaur');
                expect(pokemon.number).toBe('001');
                expect(pokemon.imageUrl).toBe('https://example.com/bulbasaur-artwork.png');
                expect(pokemon.types).toEqual(['Grass', 'Poison']);
                expect(pokemon.weight).toBe(69);
                expect(pokemon.height).toBe(7);
                expect(pokemon.abilities.length).toBe(2);
                expect(pokemon.abilities[0].name).toBe('Overgrow');
                expect(pokemon.abilities[0].isHidden).toBe(false);
                expect(pokemon.abilities[1].name).toBe('Chlorophyll');
                expect(pokemon.abilities[1].isHidden).toBe(true);
                expect(pokemon.moves.length).toBe(1);
                expect(pokemon.moves[0].name).toBe('Tackle');
                expect(pokemon.moves[0].learnMethod).toBe('level-up');
                done();
            });

            const req = httpMock.expectOne(`${baseUrl}/pokemon/1`);
            expect(req.request.method).toBe('GET');
            req.flush(mockPokemonResponse);
        });

        it('should handle Pokemon with single type', (done) => {
            const singleTypeResponse: PokemonDetailResponse = {
                ...mockPokemonResponse,
                types: [{ slot: 1, type: { name: 'fire' } }]
            };

            service.getPokemonDetail(4).subscribe(pokemon => {
                expect(pokemon.types).toEqual(['Fire']);
                done();
            });

            const req = httpMock.expectOne(`${baseUrl}/pokemon/4`);
            req.flush(singleTypeResponse);
        });

        it('should handle Pokemon #1 (edge case)', (done) => {
            service.getPokemonDetail(1).subscribe(pokemon => {
                expect(pokemon.number).toBe('001');
                done();
            });

            const req = httpMock.expectOne(`${baseUrl}/pokemon/1`);
            req.flush(mockPokemonResponse);
        });

        it('should handle Pokemon #151 (edge case)', (done) => {
            const mewResponse: PokemonDetailResponse = {
                ...mockPokemonResponse,
                id: 151,
                name: 'mew'
            };

            service.getPokemonDetail(151).subscribe(pokemon => {
                expect(pokemon.number).toBe('151');
                expect(pokemon.name).toBe('Mew');
                done();
            });

            const req = httpMock.expectOne(`${baseUrl}/pokemon/151`);
            req.flush(mewResponse);
        });

        it('should handle missing sprite data', (done) => {
            const noArtworkResponse: PokemonDetailResponse = {
                ...mockPokemonResponse,
                sprites: {
                    front_default: 'https://example.com/fallback.png',
                    other: {
                        'official-artwork': {
                            front_default: ''
                        }
                    }
                }
            };

            service.getPokemonDetail(1).subscribe(pokemon => {
                expect(pokemon.imageUrl).toBe('https://example.com/fallback.png');
                done();
            });

            const req = httpMock.expectOne(`${baseUrl}/pokemon/1`);
            req.flush(noArtworkResponse);
        });
    });

    describe('getPokemonBatch', () => {
        it('should fetch multiple Pokemon in parallel', (done) => {
            const mockResponse1: PokemonDetailResponse = {
                id: 1,
                name: 'bulbasaur',
                sprites: {
                    front_default: 'url1',
                    other: { 'official-artwork': { front_default: 'url1' } }
                },
                types: [{ slot: 1, type: { name: 'grass' } }],
                weight: 69,
                height: 7,
                abilities: [],
                moves: []
            };

            const mockResponse2: PokemonDetailResponse = {
                ...mockResponse1,
                id: 2,
                name: 'ivysaur'
            };

            service.getPokemonBatch([1, 2]).subscribe(results => {
                expect(results.length).toBe(2);
                expect(results[0].id).toBe(1);
                expect(results[1].id).toBe(2);
                done();
            });

            const req1 = httpMock.expectOne(`${baseUrl}/pokemon/1`);
            const req2 = httpMock.expectOne(`${baseUrl}/pokemon/2`);

            req1.flush(mockResponse1);
            req2.flush(mockResponse2);
        });

        it('should return empty array for empty input', (done) => {
            service.getPokemonBatch([]).subscribe(results => {
                expect(results).toEqual([]);
                done();
            });
        });
    });

    describe('data transformation', () => {
        it('should capitalize Pokemon names correctly', (done) => {
            const mockResponse: PokemonDetailResponse = {
                id: 122,
                name: 'mr-mime',
                sprites: {
                    front_default: 'url',
                    other: { 'official-artwork': { front_default: 'url' } }
                },
                types: [{ slot: 1, type: { name: 'psychic' } }],
                weight: 545,
                height: 13,
                abilities: [
                    { ability: { name: 'soundproof' }, is_hidden: false }
                ],
                moves: []
            };

            service.getPokemonDetail(122).subscribe(pokemon => {
                expect(pokemon.name).toBe('Mr Mime');
                expect(pokemon.abilities[0].name).toBe('Soundproof');
                done();
            });

            const req = httpMock.expectOne(`${baseUrl}/pokemon/122`);
            req.flush(mockResponse);
        });

        it('should sort types by slot number', (done) => {
            const mockResponse: PokemonDetailResponse = {
                id: 1,
                name: 'test',
                sprites: {
                    front_default: 'url',
                    other: { 'official-artwork': { front_default: 'url' } }
                },
                types: [
                    { slot: 2, type: { name: 'poison' } },
                    { slot: 1, type: { name: 'grass' } }
                ],
                weight: 10,
                height: 10,
                abilities: [],
                moves: []
            };

            service.getPokemonDetail(1).subscribe(pokemon => {
                expect(pokemon.types).toEqual(['Grass', 'Poison']);
                done();
            });

            const req = httpMock.expectOne(`${baseUrl}/pokemon/1`);
            req.flush(mockResponse);
        });
    });
});
