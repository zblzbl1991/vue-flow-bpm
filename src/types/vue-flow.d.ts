declare module '@vue-flow/core' {
  import VueFlowComponent from '@vue-flow/core/dist/components/VueFlow/VueFlow.vue'
  export const VueFlow: typeof VueFlowComponent

  // Re-export all types
  export * from '@vue-flow/core/dist/types'

  // Export Handle component
  import HandleComponent from '@vue-flow/core/dist/components/Handle/Handle.vue'
  export const Handle: typeof HandleComponent
}

declare module '@vue-flow/background' {
  import BackgroundComponent from '@vue-flow/background/dist/component/Background.vue'
  export const Background: typeof BackgroundComponent
}

declare module '@vue-flow/controls' {
  import ControlsComponent from '@vue-flow/controls/dist/component/Controls.vue'
  export const Controls: typeof ControlsComponent
}

declare module '@vue-flow/minimap' {
  import MinimapComponent from '@vue-flow/minimap/dist/component/Minimap.vue'
  export const Minimap: typeof MinimapComponent
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
