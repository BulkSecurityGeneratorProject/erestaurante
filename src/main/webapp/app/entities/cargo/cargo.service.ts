import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { SERVER_API_URL } from '../../app.constants';

import { Cargo } from './cargo.model';
import { ResponseWrapper, createRequestOption } from '../../shared';
import {ColaboradorService} from "../colaborador/colaborador.service";
import {Colaborador} from "../colaborador/colaborador.model";
import { JhiEventManager } from 'ng-jhipster';

@Injectable()
export class CargoService {

    private resourceUrl = SERVER_API_URL + 'api/cargos';

    constructor(private http: Http,
                private eventManager: JhiEventManager,
                private colaboradorService: ColaboradorService) { }

    create(cargo: Cargo): Observable<Cargo> {
        const copy = this.convert(cargo);
        return this.http.post(this.resourceUrl, copy).map((res: Response) => {
            const jsonResponse = res.json();

            this.eventManager.broadcast({
                name: 'cargo',
                content: 'create'
            });

            return this.convertItemFromServer(jsonResponse);
        });
    }

    update(cargo: Cargo): Observable<Cargo> {
        const copy = this.convert(cargo);
        return this.http.put(this.resourceUrl, copy).map((res: Response) => {
            const jsonResponse = res.json();

            this.eventManager.broadcast({
                name: 'cargo',
                content: 'update'
            });

            return this.convertItemFromServer(jsonResponse);
        });
    }

    find(id: number): Observable<Cargo> {
        return this.http.get(`${this.resourceUrl}/${id}`).map((res: Response) => {
            const jsonResponse = res.json();
            return this.convertItemFromServer(jsonResponse);
        });
    }

    query(req?: any): Observable<ResponseWrapper> {
        const options = createRequestOption(req);
        return this.http.get(this.resourceUrl, options)
            .map((res: Response) => this.convertResponse(res));
    }

    delete(id: number): Observable<Response> {

        return this.http.delete(`${this.resourceUrl}/${id}`)
            .map(res => {

                this.eventManager.broadcast({
                    name: 'cargo',
                    content: 'delete'
                });

                return res;
            });
    }

    private convertResponse(res: Response): ResponseWrapper {
        const jsonResponse = res.json();
        const result = [];
        for (let i = 0; i < jsonResponse.length; i++) {
            result.push(this.convertItemFromServer(jsonResponse[i]));
        }
        return new ResponseWrapper(res.headers, result, res.status);
    }

    /**
     * Convert a returned JSON object to Cargo.
     */
    private convertItemFromServer(json: any): Cargo {
        const entity: Cargo = Object.assign(new Cargo(), json);
        return entity;
    }

    /**
     * Convert a Cargo to a JSON which can be sent to the server.
     */
    private convert(cargo: Cargo): Cargo {
        const copy: Cargo = Object.assign({}, cargo);
        return copy;
    }


    public getCurrentAutorithies(): Observable<string[]> {
        return this.colaboradorService.getCurrentColaborador()
            .map((colaborador: Colaborador) => {

                const privilegios :string[] = [];

                colaborador.cargos.forEach( (cargo :Cargo) => {

                    const per :string=  cargo.permissao;
                    if (per != null && per.length > 0) {
                        per.split(',').forEach( (priv :string) => {
                            if (privilegios.indexOf(priv) < 0) {
                                privilegios.push(priv);
                            }
                        })
                    }
                });
                return privilegios;
            });
    }


}
