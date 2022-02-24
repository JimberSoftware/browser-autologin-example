<template>
  <div class="home">
    <div style="display: flex; width: 100%; justify-content: flex-end; align-items: center">
      <div style="margin-right: 16px" class="radio-btn-wrapper">
        <template v-for="configuration in Configurations" :key="configuration">
          <input
            type="radio"
            name="environment"
            :value="configuration"
            :id="configuration"
            v-model="environment"
            @change="configurationChanged()"
          />
          <label :for="configuration">{{ configuration }}</label>
        </template>
      </div>
    </div>
    <h2>Browser auto login</h2>
    <input
      placeholder="custom browser domain eg: localhost:3000"
      v-model="currentConfig.browserUrl"
      style="width: 300px"
    />
    <br />
    <br />
    <textarea v-model="mnemonic" name="mnemonic" id="mnemonic" style="width: 300px; height: 100px"> </textarea>
    <br />
    <br />
    <div class="flex-container">
      <div>
        <div style="width: 30%; text-align: center">URL</div>
        <input v-model="credentials.url" style="padding: 5px; text-align: center" />
      </div>
      <div>
        <div style="width: 30%; text-align: center">Username</div>
        <input v-model="credentials.username" style="padding: 5px; text-align: center" />
      </div>
      <div>
        <div style="width: 30%; text-align: center">Password</div>
        <input v-model="credentials.password" style="padding: 5px; text-align: center" />
      </div>
    </div>
    <br />
    <br />
    <a class="autologin-url" target="_blank" v-bind:href="browserLink">{{ browserLink }}</a>
    <br />
    <div class="btn-wrapper">
      <button class="button" @click="generate">generate</button>
      <button class="button" @click="login">login</button>
      <button class="button" @click="reset">reset</button>
    </div>

    <hr />
    <br />
  </div>
</template>

<script lang="ts">
  import { environment, ProductionConfig, StagingConfig, TestingConfig, IConfig, CustomConfig } from '@/config/config';
  import { computed, defineComponent, reactive, ref, watch } from 'vue';
  import { generateMnemonic, generateKeyPair, encrypt } from '@/crypto';
  import { Configurations } from '@/enums';
  import axios from 'axios';
  import { decodeBase64, decodeUTF8, encodeBase64 } from 'tweetnacl-util';

  const getConfigByName = (name: string): IConfig => {
    if (name === 'PRODUCTION') {
      return ProductionConfig;
    } else if (name === 'STAGING') {
      return StagingConfig;
    } else if (name === 'TESTING') {
      return TestingConfig;
    } else {
      return CustomConfig;
    }
  };
  export default defineComponent({
    setup() {
      const useCustomEnv = false;
      const radioCustomEnv = ref(null);
      const mnemonic = ref();
      const browserLink = ref('about:blank');
      const credentials = reactive({
        url: null,
        username: null,
        password: null,
      });

      mnemonic.value = generateMnemonic();

      let currentConfig = ref(getConfigByName(environment.value));

      const login = () => {
        window.open(browserLink.value, '_blank');
      };

      const configurationChanged = (e: string) => {
        currentConfig.value = getConfigByName(environment.value);
      };

      const generate = async () => {
        try {
          const keyPair = generateKeyPair(mnemonic.value);
          const res = await axios.get(`${currentConfig.value.browserUrl}/publickey`);
          const browserPublicKey = res.data.publicKey;
          const { nonce, cipher } = encrypt(
            keyPair.privateKey,
            decodeBase64(browserPublicKey),
            JSON.stringify(credentials)
          );
          const body = {
            nonce: encodeBase64(nonce),
            credentials: encodeBase64(cipher),
          };
          const data = encodeBase64(decodeUTF8(JSON.stringify(body)))
            .replace(/=/g, '') // Remove padding
            .replace(/\-/g, '+') // Convert '-' to '+'
            .replace(/\_/g, '/'); // Convert '_' to '/'

          // Todo decide a path
          browserLink.value = `${currentConfig.value.browserUrl}/autologin?appId=localhost&data=${data}`;
        } catch (e) {
          console.error(e);
        }
      };

      const reset = () => {
        window.location.reload();
      };
      return {
        Configurations,
        environment,
        configurationChanged,
        login,
        mnemonic,
        browserLink,
        generate,
        useCustomEnv,
        radioCustomEnv,
        currentConfig,
        reset,
        credentials,
      };
    },
  });
</script>

<style>
  .home {
    padding: 18px;
  }

  .flex-container {
    /* width: 60%; */
    display: flex;
    flex-direction: column;
    gap: 10px;
    align-items: center;
  }

  .flex-container > div {
    display: flex;
    align-items: center;
    width: 50%;
    margin-left: -10%;
  }
  .flex-container input {
    width: 90%;
    font-size: 1rem;
  }

  .button {
    display: block;
    padding: 15px;
    /* margin: auto; */
    background: #2c3e50;
    color: white;
    border: none;
    text-transform: uppercase;
    font-weight: 600;
    font-size: 16px;
    cursor: pointer;
  }

  .btn-wrapper {
    display: flex;
    justify-content: center;
    gap: 20px;
  }

  label {
    text-transform: lowercase;
    display: block;
  }

  label::first-letter {
    text-transform: uppercase;
  }

  .radio-btn-wrapper {
    display: flex;
  }

  .autologin-url {
    width: 70%;
    margin: auto;
    display: block;
    overflow-wrap: break-word;
    min-height: 100px;
  }
</style>
