import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';

import App from '../App';
import router from '../router';

vi.mock('antdv-next', async () => {
  const { defineComponent, h } = await import('vue');
  const createSlotStub = (name: string) =>
    defineComponent({
      name,
      setup(_, { slots }) {
        return () => h('div', slots.default?.());
      },
    });
  const Checkbox = createSlotStub('AntdCheckbox') as any;
  Checkbox.Group = createSlotStub('AntdCheckboxGroup');

  return {
    App: createSlotStub('AntdApp'),
    Avatar: createSlotStub('AntdAvatar'),
    Button: createSlotStub('AntdButton'),
    Card: defineComponent({
      name: 'AntdCard',
      setup(_, { slots }) {
        return () => h('section', [slots.title?.(), slots.default?.()]);
      },
    }),
    Checkbox,
    ColorPicker: createSlotStub('AntdColorPicker'),
    ConfigProvider: createSlotStub('AntdConfigProvider'),
    Divider: createSlotStub('AntdDivider'),
    Empty: createSlotStub('AntdEmpty'),
    Form: createSlotStub('AntdForm'),
    Input: createSlotStub('AntdInput'),
    Modal: defineComponent({
      name: 'AntdModal',
      props: {
        open: Boolean,
      },
      setup(props, { slots }) {
        return () => (props.open ? h('div', [slots.default?.()]) : null);
      },
    }),
    Pagination: createSlotStub('AntdPagination'),
    Progress: createSlotStub('AntdProgress'),
    Space: createSlotStub('AntdSpace'),
    Statistic: defineComponent({
      name: 'AntdStatistic',
      props: {
        title: String,
        value: [String, Number],
      },
      setup(props) {
        return () => h('div', [props.title, props.value]);
      },
    }),
    Switch: createSlotStub('AntdSwitch'),
    Tag: createSlotStub('AntdTag'),
    TextArea: createSlotStub('AntdTextArea'),
    theme: {
      darkAlgorithm: {},
      defaultAlgorithm: {},
    },
  };
});

vi.mock('@antdv-next/icons', async () => {
  const { defineComponent, h } = await import('vue');
  const icon = defineComponent({
    name: 'IconStub',
    setup() {
      return () => h('span');
    },
  });

  return {
    AppstoreOutlined: icon,
    ArrowRightOutlined: icon,
    BellOutlined: icon,
    BgColorsOutlined: icon,
    BookOutlined: icon,
    CalendarOutlined: icon,
    CloudServerOutlined: icon,
    CommentOutlined: icon,
    EyeOutlined: icon,
    FileTextOutlined: icon,
    FireOutlined: icon,
    FolderOpenOutlined: icon,
    GithubOutlined: icon,
    HistoryOutlined: icon,
    LinkOutlined: icon,
    MenuOutlined: icon,
    QqOutlined: icon,
    ReadOutlined: icon,
    SafetyCertificateOutlined: icon,
    SearchOutlined: icon,
    SettingOutlined: icon,
    ShareAltOutlined: icon,
    TagOutlined: icon,
    TagsOutlined: icon,
    UserOutlined: icon,
    VerticalAlignTopOutlined: icon,
    WechatOutlined: icon,
    WeiboOutlined: icon,
  };
});

describe('App', () => {
  it('mounts renders properly', async () => {
    await router.push('/');
    await router.isReady();

    const wrapper = mount(App, {
      global: {
        plugins: [router],
      },
    });

    expect(wrapper.text()).toContain('KwiTsukasa的小站');
  });
});
