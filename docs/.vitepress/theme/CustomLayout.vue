<script setup>
import DefaultTheme from "vitepress/theme";
const { Layout } = DefaultTheme;
</script>

<template>
    <Layout>
        <template #nav-bar-title-after>
            <span class="beta-badge">Beta</span>
        </template>
    </Layout>
</template>

<style>
.beta-badge {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    background: var(--vp-c-brand-soft);
    color: var(--vp-c-brand-1);
    padding: 2px 6px;
    border-radius: 6px;
    margin-left: 8px;
    align-self: center;
    user-select: none;
    display: inline-block;
    line-height: 1.2;
}
</style>
