import { React, ReactNative, util } from "vendetta/metro/common";
import { before } from "vendetta/patcher";
import { findByProps } from "vendetta/metro";
import { getVoiceChannelId } from "@vendetta/discord/api/voice";
import { showToast } from "@vendetta/ui/toasts";

const Text = findByProps("Text").Text;

let interval = null;
let startTime = null;

export default {
  onLoad() {
    const ChannelInfo = findByProps("ChannelInfo");

    before("ChannelInfo", ChannelInfo, "default", (_, res) => {
      const voiceChannelId = getVoiceChannelId();
      if (!voiceChannelId) return res;

      if (!startTime) {
        startTime = Date.now();
      }

      const TimerComponent = () => {
        const [time, setTime] = React.useState("00:00");

        React.useEffect(() => {
          interval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            const minutes = String(Math.floor(elapsed / 60)).padStart(2, "0");
            const seconds = String(elapsed % 60).padStart(2, "0");
            setTime(`${minutes}:${seconds}`);
          }, 1000);

          return () => clearInterval(interval);
        }, []);

        return React.createElement(Text, {
          style: { marginTop: 8, color: "#43b581", fontSize: 14 },
          children: `⏱️ Call duration: ${time}`
        });
      };

      const original = res?.props?.children?.props?.children;
      if (original && Array.isArray(original)) {
        original.push(React.createElement(TimerComponent));
      }

      return res;
    });

    showToast("CallTimer loaded ✅", getVoiceChannelId() ? 3000 : 1500);
  },

  onUnload() {
    startTime = null;
    if (interval) clearInterval(interval);
  }
};
