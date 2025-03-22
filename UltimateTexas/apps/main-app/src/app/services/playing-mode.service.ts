import { Injectable } from '@angular/core';

export enum PlayingMode {
  Ultimate = 1,
  Novo = 2,
}

@Injectable({
  providedIn: 'root'
})

export class PalyingModeService {
  private _currectMode: PlayingMode = PlayingMode.Ultimate;

  public set currectMode(playingMode: PlayingMode) {
    this._currectMode = playingMode;
  }

  public get currectMode() {
    return this._currectMode;
  }
}
