
const ReplyAction = actions['reply:'] = {
  type: 'reply:',
  name: 'Immediate Streaming Response',
  actionID: 'reply_action',
  loader: false,
  streamer: 'plugin',
  autonomy:'auto',
  init: () => {
    console.log('Initializing reply action:');
  },
  workspace: {

  },
  agent: {
    call: undefined,
  },
  model: {
    description: 'This action streams an immediate response to the user.',
    prompts: {
      systemPrompt: 'You are a helpful assistant providing an immediate response to the user\'s query.',
    },
    assets: {
      reference_files: true
    },
    includeChatHistory: true,
    usePersonality: true
  }
};

const ThinkAction = actions['think:'] = {
  type: 'think:',
  name: 'Thoughtful Response with Chain of Thought',
  actionID: 'think_action',
  loader: true,
  autonomy:'auto',
  workspace: {
    prep: (res, action) => {
      console.log('Think action prep run');
      if (!res.taskList) {
        res.chatHistory.push({role: "user", content: res.input});
      }
    }
  },
  agent: {
    call: undefined,
    aftermodel: (res, action, modelRes) => {
      res.oppyResponse = 'Short response: ' + modelRes.short_response;
      res.systemResponse = JSON.stringify(modelRes, null, 2);
      if (!res.data.think_action) res.data.think_action = {chain_of_thought: modelRes.chain_of_thought, short_response: modelRes.short_response};
      res.data.think_action.keep = true;
      res.data.think_action.response = modelRes.content;
      action.response = modelRes.content;
    }
  },
  model: {
    description: 'This action provides a thoughtful response with a chain of thought and a short response.',
    prompts: {
      systemPrompt: 'You are a helpful assistant. Think through the user\'s query step by step and provide a chain of thought and a short response.',
    },
    function_description: 'The function responds with a chain of thought and a short response.',
    function_call_props: {
      chain_of_thought: {
        type: 'string',
        description: 'A detailed chain of thought explanation of how best to responds to the user\'s query that includes every step required to arrive at an accurate response'
      },
      short_response: {
        type: 'string',
        description: 'A short response that corrects the initial response or confirms that the initial response was okay'
      }
    },
    required: ['chain_of_thought', 'short_response'],
    assets: {},
    includeChatHistory: true,
    usePersonality: true
  }
};

tasks['ask:'] = {
  type: 'ask:',
  name: 'Ask Task',
  sayComplete: true,
  planList: [ReplyAction, ThinkAction]
};