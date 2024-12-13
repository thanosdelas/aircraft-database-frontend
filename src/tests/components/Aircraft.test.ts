import { mount } from '@vue/test-utils';
import Aircraft from '@/components/Aircraft.vue';
import AircraftApi from '@/services/aircraft-api';
import aircraftFixture from '@/tests/fixtures/aircraft.json';
import aircraftTypesFixture from '@/tests/fixtures/aircraft-types.json';
import aircraftManufacturersFixture from '@/tests/fixtures/aircraft-manufacturers.json';

import {
  AircraftResults,
  AircraftTypeResults,
  AircraftManufacturerResults,
  HttpRequestError
} from '@/types/types';

describe('Aircraft.vue component', () => {
  beforeAll(() => {
    global.setTimeout = jest.fn((cb: Function) => cb()) as unknown as typeof setTimeout;
  });

  it('renders the initial message', async() => {
    const mockAircraftData = jest.spyOn(AircraftApi.prototype, 'fetchAll').mockResolvedValue(aircraftFixture as AircraftResults);
    const mockAircraftTypes = jest.spyOn(AircraftApi.prototype, 'fetchAircraftTypes').mockResolvedValue(aircraftTypesFixture as AircraftTypeResults);
    const mockAircraftManufacturers = jest.spyOn(AircraftApi.prototype, 'fetchAircraftManufacturers').mockResolvedValue(aircraftManufacturersFixture as AircraftManufacturerResults);

    const wrapper = mount(Aircraft);
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('ManufacturersTypesloading aircraft manufacturers ... Aircraft Models (...) (...)loading aircraft ...');

    await Promise.resolve();

    expect(wrapper.vm.aircraftData.length).toEqual(16);
    expect(wrapper.vm.aircraftTypes.length).toEqual(12);
    expect(wrapper.vm.aircraftManufacturers.length).toEqual(11);
  });
});
