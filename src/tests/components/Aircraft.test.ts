import { mount } from '@vue/test-utils';
import Aircraft from '@/components/Aircraft.vue';

describe('Aircraft.vue component', () => {
  it('renders the initial message', async() => {
    const wrapper = await mount(Aircraft);

    expect(wrapper.text()).toContain('ManufacturersTypesloading aircraft manufacturers ... Aircraft Models (...) (...)loading aircraft ...');
  });
});
