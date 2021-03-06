<template>
  <div class="response">
    <div class="actions">
      <div class="actions-title">Response</div>
      <div class="actions-copy-wrapper" v-if="copySupported">
        <div class="action-copy" v-on:click="handleCopyResult">Copy</div>
      </div>
    </div>
    <div class="content-wrapper">
      <Monaco :code="activeActionTab.result" language="json" readonly />
      <Overlay v-if="!activeActionTab.result">
        <div class="content-overlay">Perform an Action to see its Result</div>
      </Overlay>
    </div>
  </div>
</template>
<script lang="ts">
import { mapGetters } from 'vuex'

import Monaco from '~/components/Monaco.vue'
import Overlay from '~/components/Overlay.vue'

import { COPY_SUPPORTED } from './common'

export default {
  components: { Monaco, Overlay },
  computed: {
    ...mapGetters({
      activeActionTab: 'getActiveActionTab',
    }),
    copySupported() {
      return COPY_SUPPORTED && this.activeActionTab.result
    },
  },
  methods: {
    handleCopyResult() {
      navigator.clipboard.writeText(this.activeActionTab.result)
      this.$toasted.show('Copied Result to Clipboard', {
        type: 'success',
        position: 'bottom-center',
        duration: 1500,
      })
    },
  },
}
</script>
<style lang="scss" scoped>
@use "~/styles/mixins" as *;
@use "~/styles/variables" as *;

.response {
  width: calc(50% - 12px);
  background-color: $white;
  @include flex($column: true, $flex: 1);
}
.actions {
  align-items: center;
  @include border($bb: 1);
  @include flex($row: true, $pv: 1, $ph: 2.5);
}
.actions-title {
  font-weight: 500;
  @include text-medium;
}
.actions-copy-wrapper {
  justify-content: flex-end;
  @include flex($row: true, $flex: 1);
}
.action-copy {
  cursor: pointer;
  user-select: none;
  box-shadow: 0px 1px 5px rgba(24, 59, 140, 0.2);
  @include text-small;
  @include border($b: 1);
  @include flex($row: true, $ph: 1, $pv: 0.5);
}
.content-wrapper {
  position: relative;
  overflow: hidden;
  @include flex($column: true, $flex: 1);
}
.content-overlay {
  color: $grey90;
  align-items: center;
  justify-content: center;
  @include text-xlarge;
  @include flex($column: true, $flex: 1);
}
</style>
