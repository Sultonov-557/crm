import { Injectable } from '@nestjs/common';
import {readFileSync} from'fs'
import { HttpError } from 'src/common/exception/http.error';

@Injectable()
export class LocationService {

  private regionsData = JSON.parse(readFileSync('src/modules/location/json/regions.json', 'utf-8'));
  private districtsData = JSON.parse(readFileSync('src/modules/location/json/districts.json', 'utf-8'));

  findAll() {
    return  this.regionsData
  }

  findOne(id: number) {
    const region = this.regionsData.find((r) => r.id === id);
    if (!region) {
      throw HttpError({ code: 'Region not found' });
    }
    const districts =this.districtsData.filter((d) => d.region_id === id);

    return {
      region,
      districts,
    };
  }
}
