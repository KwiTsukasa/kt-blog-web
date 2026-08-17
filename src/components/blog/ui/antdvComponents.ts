import { Button, Checkbox, ColorPicker, Form, Input, Modal, Switch, TextArea } from 'antdv-next'

// antdv-next 当前 TSX 类型未完整暴露 id/class/aria 等透传属性，运行时支持；这里集中做博客组件层适配。
export const BlogButton = Button as any
export const BlogCheckbox = Checkbox as any
export const BlogColorPicker = ColorPicker as any
export const BlogForm = Form as any
export const BlogInput = Input as any
export const BlogModalComponent = Modal as any
export const BlogSwitch = Switch as any
export const BlogTextArea = TextArea as any
