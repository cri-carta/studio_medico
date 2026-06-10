'use strict';

customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">frontend documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                                <li class="link">
                                    <a href="overview.html" data-type="chapter-link">
                                        <span class="icon ion-ios-keypad"></span>Overview
                                    </a>
                                </li>

                            <li class="link">
                                <a href="index.html" data-type="chapter-link">
                                    <span class="icon ion-ios-paper"></span>
                                        README
                                </a>
                            </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                                <li class="link">
                                    <a href="properties.html" data-type="chapter-link">
                                        <span class="icon ion-ios-apps"></span>Properties
                                    </a>
                                </li>

                    </ul>
                </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#components-links"' :
                            'data-bs-target="#xs-components-links"' }>
                            <span class="icon ion-md-cog"></span>
                            <span>Components</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="components-links"' : 'id="xs-components-links"' }>
                            <li class="link">
                                <a href="components/App.html" data-type="entity-link" >App</a>
                            </li>
                            <li class="link">
                                <a href="components/DashboardMedicoComponent.html" data-type="entity-link" >DashboardMedicoComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/DashboardPazienteComponent.html" data-type="entity-link" >DashboardPazienteComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/LoginComponent.html" data-type="entity-link" >LoginComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PianoAlimentareComponent.html" data-type="entity-link" >PianoAlimentareComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SchedaPazienteComponent.html" data-type="entity-link" >SchedaPazienteComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/VisualizzaPianoComponent.html" data-type="entity-link" >VisualizzaPianoComponent</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#injectables-links"' :
                                'data-bs-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/AuthService.html" data-type="entity-link" >AuthService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MedicoService.html" data-type="entity-link" >MedicoService</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#interfaces-links"' :
                            'data-bs-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/CustomJwtPayload.html" data-type="entity-link" >CustomJwtPayload</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GiornoPiano.html" data-type="entity-link" >GiornoPiano</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GiornoPianoAI.html" data-type="entity-link" >GiornoPianoAI</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/NuovaVisita.html" data-type="entity-link" >NuovaVisita</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Pasto.html" data-type="entity-link" >Pasto</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Paziente.html" data-type="entity-link" >Paziente</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Paziente-1.html" data-type="entity-link" >Paziente</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PianoAlimentare.html" data-type="entity-link" >PianoAlimentare</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PianoSettimanaleAI.html" data-type="entity-link" >PianoSettimanaleAI</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PianoVoce.html" data-type="entity-link" >PianoVoce</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RispostaAnalisiAI.html" data-type="entity-link" >RispostaAnalisiAI</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RispostaTabellaAI.html" data-type="entity-link" >RispostaTabellaAI</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Utente.html" data-type="entity-link" >Utente</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Visita.html" data-type="entity-link" >Visita</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Visita-1.html" data-type="entity-link" >Visita</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VoceAlimento.html" data-type="entity-link" >VoceAlimento</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VocePasto.html" data-type="entity-link" >VocePasto</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#miscellaneous-links"'
                            : 'data-bs-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <a data-type="chapter-link" href="routes.html"><span class="icon ion-ios-git-branch"></span>Routes</a>
                        </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank" rel="noopener noreferrer">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});