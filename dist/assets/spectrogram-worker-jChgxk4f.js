(function() {
	var asconfig_default = {
		targets: {
			"test": {
				"outFile": "as/build/index.wasm",
				"textFile": "as/build/index.wat",
				"optimizeLevel": 0,
				"converge": false,
				"sourceMap": true,
				"debug": true,
				"noAssert": false,
				"uncheckedBehavior": "never"
			},
			"debug": {
				"outFile": "as/build/index.wasm",
				"textFile": "as/build/index.wat",
				"optimizeLevel": 0,
				"converge": false,
				"sourceMap": true,
				"debug": true,
				"noAssert": true,
				"uncheckedBehavior": "always"
			},
			"release": {
				"outFile": "as/build/index.wasm",
				"textFile": "as/build/index.wat",
				"optimizeLevel": 3,
				"shrinkLevel": 2,
				"converge": false,
				"sourceMap": true,
				"debug": true,
				"noAssert": true,
				"uncheckedBehavior": "always"
			}
		},
		options: {
			"enable": [
				"simd",
				"relaxed-simd",
				"threads"
			],
			"importMemory": true,
			"initialMemory": 64,
			"maximumMemory": 16384,
			"sharedMemory": true,
			"bindings": "esm",
			"runtime": "minimal",
			"exportRuntime": true
		}
	};
	const AUDIO_VM_INFO_STRIDE = 29;
	const HISTORY_META_STRIDE = 20;
	let AudioVmOp = /* @__PURE__ */ function(AudioVmOp$1) {
		AudioVmOp$1[AudioVmOp$1["Out"] = 0] = "Out";
		AudioVmOp$1[AudioVmOp$1["Solo"] = 1] = "Solo";
		AudioVmOp$1[AudioVmOp$1["Post"] = 2] = "Post";
		AudioVmOp$1[AudioVmOp$1["PushScalar"] = 3] = "PushScalar";
		AudioVmOp$1[AudioVmOp$1["PushAudio"] = 4] = "PushAudio";
		AudioVmOp$1[AudioVmOp$1["PushUndefined"] = 5] = "PushUndefined";
		AudioVmOp$1[AudioVmOp$1["SetBpm"] = 6] = "SetBpm";
		AudioVmOp$1[AudioVmOp$1["Time"] = 7] = "Time";
		AudioVmOp$1[AudioVmOp$1["TableLookup"] = 8] = "TableLookup";
		AudioVmOp$1[AudioVmOp$1["Alloc"] = 9] = "Alloc";
		AudioVmOp$1[AudioVmOp$1["Write"] = 10] = "Write";
		AudioVmOp$1[AudioVmOp$1["Read"] = 11] = "Read";
		AudioVmOp$1[AudioVmOp$1["Tram"] = 12] = "Tram";
		AudioVmOp$1[AudioVmOp$1["Mini"] = 13] = "Mini";
		AudioVmOp$1[AudioVmOp$1["Timeline"] = 14] = "Timeline";
		AudioVmOp$1[AudioVmOp$1["Oversample"] = 15] = "Oversample";
		AudioVmOp$1[AudioVmOp$1["MakeArray"] = 16] = "MakeArray";
		AudioVmOp$1[AudioVmOp$1["ArrayGet"] = 17] = "ArrayGet";
		AudioVmOp$1[AudioVmOp$1["ArraySet"] = 18] = "ArraySet";
		AudioVmOp$1[AudioVmOp$1["ArrayLen"] = 19] = "ArrayLen";
		AudioVmOp$1[AudioVmOp$1["ArrayPush"] = 20] = "ArrayPush";
		AudioVmOp$1[AudioVmOp$1["Walk"] = 21] = "Walk";
		AudioVmOp$1[AudioVmOp$1["Glide"] = 22] = "Glide";
		AudioVmOp$1[AudioVmOp$1["Step"] = 23] = "Step";
		AudioVmOp$1[AudioVmOp$1["Random"] = 24] = "Random";
		AudioVmOp$1[AudioVmOp$1["GetSystem"] = 25] = "GetSystem";
		AudioVmOp$1[AudioVmOp$1["GetGlobal"] = 26] = "GetGlobal";
		AudioVmOp$1[AudioVmOp$1["GetLocal"] = 27] = "GetLocal";
		AudioVmOp$1[AudioVmOp$1["SetGlobal"] = 28] = "SetGlobal";
		AudioVmOp$1[AudioVmOp$1["SetLocal"] = 29] = "SetLocal";
		AudioVmOp$1[AudioVmOp$1["GetClosure"] = 30] = "GetClosure";
		AudioVmOp$1[AudioVmOp$1["SetClosure"] = 31] = "SetClosure";
		AudioVmOp$1[AudioVmOp$1["GetCellRefLocal"] = 32] = "GetCellRefLocal";
		AudioVmOp$1[AudioVmOp$1["GetCellRefGlobal"] = 33] = "GetCellRefGlobal";
		AudioVmOp$1[AudioVmOp$1["GetCellRefClosure"] = 34] = "GetCellRefClosure";
		AudioVmOp$1[AudioVmOp$1["DefineFunction"] = 35] = "DefineFunction";
		AudioVmOp$1[AudioVmOp$1["CallFunction"] = 36] = "CallFunction";
		AudioVmOp$1[AudioVmOp$1["Return"] = 37] = "Return";
		AudioVmOp$1[AudioVmOp$1["Throw"] = 38] = "Throw";
		AudioVmOp$1[AudioVmOp$1["PushTryBlock"] = 39] = "PushTryBlock";
		AudioVmOp$1[AudioVmOp$1["PopTryBlock"] = 40] = "PopTryBlock";
		AudioVmOp$1[AudioVmOp$1["Jump"] = 41] = "Jump";
		AudioVmOp$1[AudioVmOp$1["JumpIfFalse"] = 42] = "JumpIfFalse";
		AudioVmOp$1[AudioVmOp$1["JumpIfTrue"] = 43] = "JumpIfTrue";
		AudioVmOp$1[AudioVmOp$1["PushClosure"] = 44] = "PushClosure";
		AudioVmOp$1[AudioVmOp$1["PopScope"] = 45] = "PopScope";
		AudioVmOp$1[AudioVmOp$1["Dup"] = 46] = "Dup";
		AudioVmOp$1[AudioVmOp$1["Pop"] = 47] = "Pop";
		AudioVmOp$1[AudioVmOp$1["Neg"] = 48] = "Neg";
		AudioVmOp$1[AudioVmOp$1["Not"] = 49] = "Not";
		AudioVmOp$1[AudioVmOp$1["BitNot"] = 50] = "BitNot";
		AudioVmOp$1[AudioVmOp$1["Add"] = 51] = "Add";
		AudioVmOp$1[AudioVmOp$1["Sub"] = 52] = "Sub";
		AudioVmOp$1[AudioVmOp$1["Mul"] = 53] = "Mul";
		AudioVmOp$1[AudioVmOp$1["Div"] = 54] = "Div";
		AudioVmOp$1[AudioVmOp$1["Mod"] = 55] = "Mod";
		AudioVmOp$1[AudioVmOp$1["Pow"] = 56] = "Pow";
		AudioVmOp$1[AudioVmOp$1["Greater"] = 57] = "Greater";
		AudioVmOp$1[AudioVmOp$1["Less"] = 58] = "Less";
		AudioVmOp$1[AudioVmOp$1["GreaterEqual"] = 59] = "GreaterEqual";
		AudioVmOp$1[AudioVmOp$1["LessEqual"] = 60] = "LessEqual";
		AudioVmOp$1[AudioVmOp$1["Equal"] = 61] = "Equal";
		AudioVmOp$1[AudioVmOp$1["NotEqual"] = 62] = "NotEqual";
		AudioVmOp$1[AudioVmOp$1["And"] = 63] = "And";
		AudioVmOp$1[AudioVmOp$1["Or"] = 64] = "Or";
		AudioVmOp$1[AudioVmOp$1["BitAnd"] = 65] = "BitAnd";
		AudioVmOp$1[AudioVmOp$1["BitOr"] = 66] = "BitOr";
		AudioVmOp$1[AudioVmOp$1["BitXor"] = 67] = "BitXor";
		AudioVmOp$1[AudioVmOp$1["ShiftLeft"] = 68] = "ShiftLeft";
		AudioVmOp$1[AudioVmOp$1["ShiftRight"] = 69] = "ShiftRight";
		AudioVmOp$1[AudioVmOp$1["IsUndefined"] = 70] = "IsUndefined";
		AudioVmOp$1[AudioVmOp$1["IsScalar"] = 71] = "IsScalar";
		AudioVmOp$1[AudioVmOp$1["IsAudio"] = 72] = "IsAudio";
		AudioVmOp$1[AudioVmOp$1["IsArray"] = 73] = "IsArray";
		AudioVmOp$1[AudioVmOp$1["IsFunction"] = 74] = "IsFunction";
		AudioVmOp$1[AudioVmOp$1["MathUnary"] = 75] = "MathUnary";
		AudioVmOp$1[AudioVmOp$1["MathBinary"] = 76] = "MathBinary";
		AudioVmOp$1[AudioVmOp$1["MathTernary"] = 77] = "MathTernary";
		AudioVmOp$1[AudioVmOp$1["GenPhasor_default"] = 78] = "GenPhasor_default";
		AudioVmOp$1[AudioVmOp$1["GenEvery_default"] = 79] = "GenEvery_default";
		AudioVmOp$1[AudioVmOp$1["GenWhite_default"] = 80] = "GenWhite_default";
		AudioVmOp$1[AudioVmOp$1["GenLfosqr_default"] = 81] = "GenLfosqr_default";
		AudioVmOp$1[AudioVmOp$1["GenLfosah_default"] = 82] = "GenLfosah_default";
		AudioVmOp$1[AudioVmOp$1["GenDc_default"] = 83] = "GenDc_default";
		AudioVmOp$1[AudioVmOp$1["GenGauss_default"] = 84] = "GenGauss_default";
		AudioVmOp$1[AudioVmOp$1["GenImpulse_default"] = 85] = "GenImpulse_default";
		AudioVmOp$1[AudioVmOp$1["GenTestGain_default"] = 86] = "GenTestGain_default";
		AudioVmOp$1[AudioVmOp$1["GenFreeverb_default"] = 87] = "GenFreeverb_default";
		AudioVmOp$1[AudioVmOp$1["GenSaw_default"] = 88] = "GenSaw_default";
		AudioVmOp$1[AudioVmOp$1["GenTestOversample_default"] = 89] = "GenTestOversample_default";
		AudioVmOp$1[AudioVmOp$1["GenSine_default"] = 90] = "GenSine_default";
		AudioVmOp$1[AudioVmOp$1["GenLfosine_default"] = 91] = "GenLfosine_default";
		AudioVmOp$1[AudioVmOp$1["GenSlicer_default"] = 92] = "GenSlicer_default";
		AudioVmOp$1[AudioVmOp$1["GenBrown_default"] = 93] = "GenBrown_default";
		AudioVmOp$1[AudioVmOp$1["GenEuclid_default"] = 94] = "GenEuclid_default";
		AudioVmOp$1[AudioVmOp$1["GenPwm_default"] = 95] = "GenPwm_default";
		AudioVmOp$1[AudioVmOp$1["GenAd_default"] = 96] = "GenAd_default";
		AudioVmOp$1[AudioVmOp$1["GenOnepole_lp1"] = 97] = "GenOnepole_lp1";
		AudioVmOp$1[AudioVmOp$1["GenOnepole_hp1"] = 98] = "GenOnepole_hp1";
		AudioVmOp$1[AudioVmOp$1["GenSqr_default"] = 99] = "GenSqr_default";
		AudioVmOp$1[AudioVmOp$1["GenHold_default"] = 100] = "GenHold_default";
		AudioVmOp$1[AudioVmOp$1["GenLfosaw_default"] = 101] = "GenLfosaw_default";
		AudioVmOp$1[AudioVmOp$1["GenCompressor_default"] = 102] = "GenCompressor_default";
		AudioVmOp$1[AudioVmOp$1["GenEmit_default"] = 103] = "GenEmit_default";
		AudioVmOp$1[AudioVmOp$1["GenFractal_default"] = 104] = "GenFractal_default";
		AudioVmOp$1[AudioVmOp$1["GenLforamp_default"] = 105] = "GenLforamp_default";
		AudioVmOp$1[AudioVmOp$1["GenTri_default"] = 106] = "GenTri_default";
		AudioVmOp$1[AudioVmOp$1["GenPitchshift_default"] = 107] = "GenPitchshift_default";
		AudioVmOp$1[AudioVmOp$1["GenZerox_default"] = 108] = "GenZerox_default";
		AudioVmOp$1[AudioVmOp$1["GenLimiter_default"] = 109] = "GenLimiter_default";
		AudioVmOp$1[AudioVmOp$1["GenAt_default"] = 110] = "GenAt_default";
		AudioVmOp$1[AudioVmOp$1["GenDiodeladder_default"] = 111] = "GenDiodeladder_default";
		AudioVmOp$1[AudioVmOp$1["GenRamp_default"] = 112] = "GenRamp_default";
		AudioVmOp$1[AudioVmOp$1["GenSmooth_default"] = 113] = "GenSmooth_default";
		AudioVmOp$1[AudioVmOp$1["GenLfotri_default"] = 114] = "GenLfotri_default";
		AudioVmOp$1[AudioVmOp$1["GenAdsr_default"] = 115] = "GenAdsr_default";
		AudioVmOp$1[AudioVmOp$1["GenAnalyser_default"] = 116] = "GenAnalyser_default";
		AudioVmOp$1[AudioVmOp$1["GenBiquad_lp"] = 117] = "GenBiquad_lp";
		AudioVmOp$1[AudioVmOp$1["GenBiquad_hp"] = 118] = "GenBiquad_hp";
		AudioVmOp$1[AudioVmOp$1["GenBiquad_bp"] = 119] = "GenBiquad_bp";
		AudioVmOp$1[AudioVmOp$1["GenBiquad_bs"] = 120] = "GenBiquad_bs";
		AudioVmOp$1[AudioVmOp$1["GenBiquad_ap"] = 121] = "GenBiquad_ap";
		AudioVmOp$1[AudioVmOp$1["GenEnvfollow_default"] = 122] = "GenEnvfollow_default";
		AudioVmOp$1[AudioVmOp$1["GenSah_default"] = 123] = "GenSah_default";
		AudioVmOp$1[AudioVmOp$1["GenVelvet_default"] = 124] = "GenVelvet_default";
		AudioVmOp$1[AudioVmOp$1["GenFdn_default"] = 125] = "GenFdn_default";
		AudioVmOp$1[AudioVmOp$1["GenPink_default"] = 126] = "GenPink_default";
		AudioVmOp$1[AudioVmOp$1["GenDattorro_default"] = 127] = "GenDattorro_default";
		AudioVmOp$1[AudioVmOp$1["GenRandom_default"] = 128] = "GenRandom_default";
		AudioVmOp$1[AudioVmOp$1["GenSlew_default"] = 129] = "GenSlew_default";
		AudioVmOp$1[AudioVmOp$1["GenInc_default"] = 130] = "GenInc_default";
		AudioVmOp$1[AudioVmOp$1["GenBiquadshelf_ls"] = 131] = "GenBiquadshelf_ls";
		AudioVmOp$1[AudioVmOp$1["GenBiquadshelf_hs"] = 132] = "GenBiquadshelf_hs";
		AudioVmOp$1[AudioVmOp$1["GenBiquadshelf_peak"] = 133] = "GenBiquadshelf_peak";
		AudioVmOp$1[AudioVmOp$1["GenSampler_default"] = 134] = "GenSampler_default";
		AudioVmOp$1[AudioVmOp$1["GenMoog_lpm"] = 135] = "GenMoog_lpm";
		AudioVmOp$1[AudioVmOp$1["GenMoog_hpm"] = 136] = "GenMoog_hpm";
		AudioVmOp$1[AudioVmOp$1["GenSvf_lps"] = 137] = "GenSvf_lps";
		AudioVmOp$1[AudioVmOp$1["GenSvf_hps"] = 138] = "GenSvf_hps";
		AudioVmOp$1[AudioVmOp$1["GenSvf_bps"] = 139] = "GenSvf_bps";
		AudioVmOp$1[AudioVmOp$1["GenSvf_bss"] = 140] = "GenSvf_bss";
		AudioVmOp$1[AudioVmOp$1["GenSvf_peaks"] = 141] = "GenSvf_peaks";
		AudioVmOp$1[AudioVmOp$1["GenSvf_aps"] = 142] = "GenSvf_aps";
		return AudioVmOp$1;
	}({});
	const genSpecs = [
		{
			id: 0,
			genName: "Phasor",
			variantName: "default",
			className: "Phasor_default_hz_scalar_offset_scalar_trig_scalar",
			paramNames: [
				"hz",
				"offset",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 1,
			genName: "Phasor",
			variantName: "default",
			className: "Phasor_default_hz_scalar_offset_scalar_trig_audio",
			paramNames: [
				"hz",
				"offset",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"audio"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 2,
			genName: "Phasor",
			variantName: "default",
			className: "Phasor_default_hz_scalar_offset_audio_trig_scalar",
			paramNames: [
				"hz",
				"offset",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"scalar"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 3,
			genName: "Phasor",
			variantName: "default",
			className: "Phasor_default_hz_scalar_offset_audio_trig_audio",
			paramNames: [
				"hz",
				"offset",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"audio"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 4,
			genName: "Phasor",
			variantName: "default",
			className: "Phasor_default_hz_audio_offset_scalar_trig_scalar",
			paramNames: [
				"hz",
				"offset",
				"trig"
			],
			paramModes: [
				"audio",
				"scalar",
				"scalar"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 5,
			genName: "Phasor",
			variantName: "default",
			className: "Phasor_default_hz_audio_offset_scalar_trig_audio",
			paramNames: [
				"hz",
				"offset",
				"trig"
			],
			paramModes: [
				"audio",
				"scalar",
				"audio"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 6,
			genName: "Phasor",
			variantName: "default",
			className: "Phasor_default_hz_audio_offset_audio_trig_scalar",
			paramNames: [
				"hz",
				"offset",
				"trig"
			],
			paramModes: [
				"audio",
				"audio",
				"scalar"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 7,
			genName: "Phasor",
			variantName: "default",
			className: "Phasor_default_hz_audio_offset_audio_trig_audio",
			paramNames: [
				"hz",
				"offset",
				"trig"
			],
			paramModes: [
				"audio",
				"audio",
				"audio"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 8,
			genName: "Every",
			variantName: "default",
			className: "Every_default_bars_scalar",
			paramNames: ["bars"],
			paramModes: ["scalar"],
			emitNames: ["fired"],
			usesInput: false
		},
		{
			id: 9,
			genName: "Every",
			variantName: "default",
			className: "Every_default_bars_audio",
			paramNames: ["bars"],
			paramModes: ["audio"],
			emitNames: ["fired"],
			usesInput: false
		},
		{
			id: 10,
			genName: "White",
			variantName: "default",
			className: "White_default_seed_scalar_trig_scalar",
			paramNames: ["seed", "trig"],
			paramModes: ["scalar", "scalar"],
			emitNames: [],
			usesInput: false
		},
		{
			id: 11,
			genName: "White",
			variantName: "default",
			className: "White_default_seed_scalar_trig_audio",
			paramNames: ["seed", "trig"],
			paramModes: ["scalar", "audio"],
			emitNames: [],
			usesInput: false
		},
		{
			id: 12,
			genName: "Lfosqr",
			variantName: "default",
			className: "Lfosqr_default_bar_scalar_offset_scalar_trig_scalar",
			paramNames: [
				"bar",
				"offset",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 13,
			genName: "Lfosqr",
			variantName: "default",
			className: "Lfosqr_default_bar_scalar_offset_scalar_trig_audio",
			paramNames: [
				"bar",
				"offset",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"audio"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 14,
			genName: "Lfosqr",
			variantName: "default",
			className: "Lfosqr_default_bar_scalar_offset_audio_trig_scalar",
			paramNames: [
				"bar",
				"offset",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"scalar"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 15,
			genName: "Lfosqr",
			variantName: "default",
			className: "Lfosqr_default_bar_scalar_offset_audio_trig_audio",
			paramNames: [
				"bar",
				"offset",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"audio"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 16,
			genName: "Lfosqr",
			variantName: "default",
			className: "Lfosqr_default_bar_audio_offset_scalar_trig_scalar",
			paramNames: [
				"bar",
				"offset",
				"trig"
			],
			paramModes: [
				"audio",
				"scalar",
				"scalar"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 17,
			genName: "Lfosqr",
			variantName: "default",
			className: "Lfosqr_default_bar_audio_offset_scalar_trig_audio",
			paramNames: [
				"bar",
				"offset",
				"trig"
			],
			paramModes: [
				"audio",
				"scalar",
				"audio"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 18,
			genName: "Lfosqr",
			variantName: "default",
			className: "Lfosqr_default_bar_audio_offset_audio_trig_scalar",
			paramNames: [
				"bar",
				"offset",
				"trig"
			],
			paramModes: [
				"audio",
				"audio",
				"scalar"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 19,
			genName: "Lfosqr",
			variantName: "default",
			className: "Lfosqr_default_bar_audio_offset_audio_trig_audio",
			paramNames: [
				"bar",
				"offset",
				"trig"
			],
			paramModes: [
				"audio",
				"audio",
				"audio"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 20,
			genName: "Lfosah",
			variantName: "default",
			className: "Lfosah_default_bar_scalar_offset_scalar_seed_scalar_trig_scalar",
			paramNames: [
				"bar",
				"offset",
				"seed",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 21,
			genName: "Lfosah",
			variantName: "default",
			className: "Lfosah_default_bar_scalar_offset_scalar_seed_scalar_trig_audio",
			paramNames: [
				"bar",
				"offset",
				"seed",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"scalar",
				"audio"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 22,
			genName: "Lfosah",
			variantName: "default",
			className: "Lfosah_default_bar_scalar_offset_scalar_seed_audio_trig_scalar",
			paramNames: [
				"bar",
				"offset",
				"seed",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"audio",
				"scalar"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 23,
			genName: "Lfosah",
			variantName: "default",
			className: "Lfosah_default_bar_scalar_offset_scalar_seed_audio_trig_audio",
			paramNames: [
				"bar",
				"offset",
				"seed",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"audio",
				"audio"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 24,
			genName: "Lfosah",
			variantName: "default",
			className: "Lfosah_default_bar_scalar_offset_audio_seed_scalar_trig_scalar",
			paramNames: [
				"bar",
				"offset",
				"seed",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"scalar",
				"scalar"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 25,
			genName: "Lfosah",
			variantName: "default",
			className: "Lfosah_default_bar_scalar_offset_audio_seed_scalar_trig_audio",
			paramNames: [
				"bar",
				"offset",
				"seed",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"scalar",
				"audio"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 26,
			genName: "Lfosah",
			variantName: "default",
			className: "Lfosah_default_bar_scalar_offset_audio_seed_audio_trig_scalar",
			paramNames: [
				"bar",
				"offset",
				"seed",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"audio",
				"scalar"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 27,
			genName: "Lfosah",
			variantName: "default",
			className: "Lfosah_default_bar_scalar_offset_audio_seed_audio_trig_audio",
			paramNames: [
				"bar",
				"offset",
				"seed",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"audio",
				"audio"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 28,
			genName: "Lfosah",
			variantName: "default",
			className: "Lfosah_default_bar_audio_offset_scalar_seed_scalar_trig_scalar",
			paramNames: [
				"bar",
				"offset",
				"seed",
				"trig"
			],
			paramModes: [
				"audio",
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 29,
			genName: "Lfosah",
			variantName: "default",
			className: "Lfosah_default_bar_audio_offset_scalar_seed_scalar_trig_audio",
			paramNames: [
				"bar",
				"offset",
				"seed",
				"trig"
			],
			paramModes: [
				"audio",
				"scalar",
				"scalar",
				"audio"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 30,
			genName: "Lfosah",
			variantName: "default",
			className: "Lfosah_default_bar_audio_offset_scalar_seed_audio_trig_scalar",
			paramNames: [
				"bar",
				"offset",
				"seed",
				"trig"
			],
			paramModes: [
				"audio",
				"scalar",
				"audio",
				"scalar"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 31,
			genName: "Lfosah",
			variantName: "default",
			className: "Lfosah_default_bar_audio_offset_scalar_seed_audio_trig_audio",
			paramNames: [
				"bar",
				"offset",
				"seed",
				"trig"
			],
			paramModes: [
				"audio",
				"scalar",
				"audio",
				"audio"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 32,
			genName: "Lfosah",
			variantName: "default",
			className: "Lfosah_default_bar_audio_offset_audio_seed_scalar_trig_scalar",
			paramNames: [
				"bar",
				"offset",
				"seed",
				"trig"
			],
			paramModes: [
				"audio",
				"audio",
				"scalar",
				"scalar"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 33,
			genName: "Lfosah",
			variantName: "default",
			className: "Lfosah_default_bar_audio_offset_audio_seed_scalar_trig_audio",
			paramNames: [
				"bar",
				"offset",
				"seed",
				"trig"
			],
			paramModes: [
				"audio",
				"audio",
				"scalar",
				"audio"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 34,
			genName: "Lfosah",
			variantName: "default",
			className: "Lfosah_default_bar_audio_offset_audio_seed_audio_trig_scalar",
			paramNames: [
				"bar",
				"offset",
				"seed",
				"trig"
			],
			paramModes: [
				"audio",
				"audio",
				"audio",
				"scalar"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 35,
			genName: "Lfosah",
			variantName: "default",
			className: "Lfosah_default_bar_audio_offset_audio_seed_audio_trig_audio",
			paramNames: [
				"bar",
				"offset",
				"seed",
				"trig"
			],
			paramModes: [
				"audio",
				"audio",
				"audio",
				"audio"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 36,
			genName: "Dc",
			variantName: "default",
			className: "Dc_default_",
			paramNames: [],
			paramModes: [],
			emitNames: [],
			usesInput: true
		},
		{
			id: 37,
			genName: "Gauss",
			variantName: "default",
			className: "Gauss_default_seed_scalar_trig_scalar",
			paramNames: ["seed", "trig"],
			paramModes: ["scalar", "scalar"],
			emitNames: [],
			usesInput: false
		},
		{
			id: 38,
			genName: "Gauss",
			variantName: "default",
			className: "Gauss_default_seed_scalar_trig_audio",
			paramNames: ["seed", "trig"],
			paramModes: ["scalar", "audio"],
			emitNames: [],
			usesInput: false
		},
		{
			id: 39,
			genName: "Impulse",
			variantName: "default",
			className: "Impulse_default_hz_scalar_offset_scalar_trig_scalar",
			paramNames: [
				"hz",
				"offset",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: [],
			usesInput: false
		},
		{
			id: 40,
			genName: "Impulse",
			variantName: "default",
			className: "Impulse_default_hz_scalar_offset_scalar_trig_audio",
			paramNames: [
				"hz",
				"offset",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"audio"
			],
			emitNames: [],
			usesInput: false
		},
		{
			id: 41,
			genName: "Impulse",
			variantName: "default",
			className: "Impulse_default_hz_scalar_offset_audio_trig_scalar",
			paramNames: [
				"hz",
				"offset",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"scalar"
			],
			emitNames: [],
			usesInput: false
		},
		{
			id: 42,
			genName: "Impulse",
			variantName: "default",
			className: "Impulse_default_hz_scalar_offset_audio_trig_audio",
			paramNames: [
				"hz",
				"offset",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"audio"
			],
			emitNames: [],
			usesInput: false
		},
		{
			id: 43,
			genName: "Impulse",
			variantName: "default",
			className: "Impulse_default_hz_audio_offset_scalar_trig_scalar",
			paramNames: [
				"hz",
				"offset",
				"trig"
			],
			paramModes: [
				"audio",
				"scalar",
				"scalar"
			],
			emitNames: [],
			usesInput: false
		},
		{
			id: 44,
			genName: "Impulse",
			variantName: "default",
			className: "Impulse_default_hz_audio_offset_scalar_trig_audio",
			paramNames: [
				"hz",
				"offset",
				"trig"
			],
			paramModes: [
				"audio",
				"scalar",
				"audio"
			],
			emitNames: [],
			usesInput: false
		},
		{
			id: 45,
			genName: "Impulse",
			variantName: "default",
			className: "Impulse_default_hz_audio_offset_audio_trig_scalar",
			paramNames: [
				"hz",
				"offset",
				"trig"
			],
			paramModes: [
				"audio",
				"audio",
				"scalar"
			],
			emitNames: [],
			usesInput: false
		},
		{
			id: 46,
			genName: "Impulse",
			variantName: "default",
			className: "Impulse_default_hz_audio_offset_audio_trig_audio",
			paramNames: [
				"hz",
				"offset",
				"trig"
			],
			paramModes: [
				"audio",
				"audio",
				"audio"
			],
			emitNames: [],
			usesInput: false
		},
		{
			id: 47,
			genName: "TestGain",
			variantName: "default",
			className: "TestGain_default_amount_scalar",
			paramNames: ["amount"],
			paramModes: ["scalar"],
			emitNames: [],
			usesInput: true
		},
		{
			id: 48,
			genName: "TestGain",
			variantName: "default",
			className: "TestGain_default_amount_audio",
			paramNames: ["amount"],
			paramModes: ["audio"],
			emitNames: [],
			usesInput: true
		},
		{
			id: 49,
			genName: "TestGain",
			variantName: "default",
			className: "TestGain_default_amount_scalar_stereo",
			paramNames: ["amount"],
			paramModes: ["scalar"],
			emitNames: [],
			usesInput: true
		},
		{
			id: 50,
			genName: "TestGain",
			variantName: "default",
			className: "TestGain_default_amount_audio_stereo",
			paramNames: ["amount"],
			paramModes: ["audio"],
			emitNames: [],
			usesInput: true
		},
		{
			id: 51,
			genName: "Freeverb",
			variantName: "default",
			className: "Freeverb_default_room_scalar_damping_scalar",
			paramNames: ["room", "damping"],
			paramModes: ["scalar", "scalar"],
			emitNames: [],
			usesInput: true
		},
		{
			id: 52,
			genName: "Freeverb",
			variantName: "default",
			className: "Freeverb_default_room_scalar_damping_audio",
			paramNames: ["room", "damping"],
			paramModes: ["scalar", "audio"],
			emitNames: [],
			usesInput: true
		},
		{
			id: 53,
			genName: "Freeverb",
			variantName: "default",
			className: "Freeverb_default_room_audio_damping_scalar",
			paramNames: ["room", "damping"],
			paramModes: ["audio", "scalar"],
			emitNames: [],
			usesInput: true
		},
		{
			id: 54,
			genName: "Freeverb",
			variantName: "default",
			className: "Freeverb_default_room_audio_damping_audio",
			paramNames: ["room", "damping"],
			paramModes: ["audio", "audio"],
			emitNames: [],
			usesInput: true
		},
		{
			id: 55,
			genName: "Freeverb",
			variantName: "default",
			className: "Freeverb_default_room_scalar_damping_scalar_stereo",
			paramNames: ["room", "damping"],
			paramModes: ["scalar", "scalar"],
			emitNames: [],
			usesInput: true
		},
		{
			id: 56,
			genName: "Freeverb",
			variantName: "default",
			className: "Freeverb_default_room_scalar_damping_audio_stereo",
			paramNames: ["room", "damping"],
			paramModes: ["scalar", "audio"],
			emitNames: [],
			usesInput: true
		},
		{
			id: 57,
			genName: "Freeverb",
			variantName: "default",
			className: "Freeverb_default_room_audio_damping_scalar_stereo",
			paramNames: ["room", "damping"],
			paramModes: ["audio", "scalar"],
			emitNames: [],
			usesInput: true
		},
		{
			id: 58,
			genName: "Freeverb",
			variantName: "default",
			className: "Freeverb_default_room_audio_damping_audio_stereo",
			paramNames: ["room", "damping"],
			paramModes: ["audio", "audio"],
			emitNames: [],
			usesInput: true
		},
		{
			id: 59,
			genName: "Saw",
			variantName: "default",
			className: "Saw_default_hz_scalar_offset_scalar_trig_scalar",
			paramNames: [
				"hz",
				"offset",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: [],
			usesInput: false
		},
		{
			id: 60,
			genName: "Saw",
			variantName: "default",
			className: "Saw_default_hz_scalar_offset_scalar_trig_audio",
			paramNames: [
				"hz",
				"offset",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"audio"
			],
			emitNames: [],
			usesInput: false
		},
		{
			id: 61,
			genName: "Saw",
			variantName: "default",
			className: "Saw_default_hz_scalar_offset_audio_trig_scalar",
			paramNames: [
				"hz",
				"offset",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"scalar"
			],
			emitNames: [],
			usesInput: false
		},
		{
			id: 62,
			genName: "Saw",
			variantName: "default",
			className: "Saw_default_hz_scalar_offset_audio_trig_audio",
			paramNames: [
				"hz",
				"offset",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"audio"
			],
			emitNames: [],
			usesInput: false
		},
		{
			id: 63,
			genName: "Saw",
			variantName: "default",
			className: "Saw_default_hz_audio_offset_scalar_trig_scalar",
			paramNames: [
				"hz",
				"offset",
				"trig"
			],
			paramModes: [
				"audio",
				"scalar",
				"scalar"
			],
			emitNames: [],
			usesInput: false
		},
		{
			id: 64,
			genName: "Saw",
			variantName: "default",
			className: "Saw_default_hz_audio_offset_scalar_trig_audio",
			paramNames: [
				"hz",
				"offset",
				"trig"
			],
			paramModes: [
				"audio",
				"scalar",
				"audio"
			],
			emitNames: [],
			usesInput: false
		},
		{
			id: 65,
			genName: "Saw",
			variantName: "default",
			className: "Saw_default_hz_audio_offset_audio_trig_scalar",
			paramNames: [
				"hz",
				"offset",
				"trig"
			],
			paramModes: [
				"audio",
				"audio",
				"scalar"
			],
			emitNames: [],
			usesInput: false
		},
		{
			id: 66,
			genName: "Saw",
			variantName: "default",
			className: "Saw_default_hz_audio_offset_audio_trig_audio",
			paramNames: [
				"hz",
				"offset",
				"trig"
			],
			paramModes: [
				"audio",
				"audio",
				"audio"
			],
			emitNames: [],
			usesInput: false
		},
		{
			id: 67,
			genName: "TestOversample",
			variantName: "default",
			className: "TestOversample_default_",
			paramNames: [],
			paramModes: [],
			emitNames: [],
			usesInput: false
		},
		{
			id: 68,
			genName: "TestOversample",
			variantName: "default",
			className: "TestOversample_default__stereo",
			paramNames: [],
			paramModes: [],
			emitNames: [],
			usesInput: false
		},
		{
			id: 69,
			genName: "Sine",
			variantName: "default",
			className: "Sine_default_hz_scalar_offset_scalar_trig_scalar",
			paramNames: [
				"hz",
				"offset",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: [],
			usesInput: false
		},
		{
			id: 70,
			genName: "Sine",
			variantName: "default",
			className: "Sine_default_hz_scalar_offset_scalar_trig_audio",
			paramNames: [
				"hz",
				"offset",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"audio"
			],
			emitNames: [],
			usesInput: false
		},
		{
			id: 71,
			genName: "Sine",
			variantName: "default",
			className: "Sine_default_hz_scalar_offset_audio_trig_scalar",
			paramNames: [
				"hz",
				"offset",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"scalar"
			],
			emitNames: [],
			usesInput: false
		},
		{
			id: 72,
			genName: "Sine",
			variantName: "default",
			className: "Sine_default_hz_scalar_offset_audio_trig_audio",
			paramNames: [
				"hz",
				"offset",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"audio"
			],
			emitNames: [],
			usesInput: false
		},
		{
			id: 73,
			genName: "Sine",
			variantName: "default",
			className: "Sine_default_hz_audio_offset_scalar_trig_scalar",
			paramNames: [
				"hz",
				"offset",
				"trig"
			],
			paramModes: [
				"audio",
				"scalar",
				"scalar"
			],
			emitNames: [],
			usesInput: false
		},
		{
			id: 74,
			genName: "Sine",
			variantName: "default",
			className: "Sine_default_hz_audio_offset_scalar_trig_audio",
			paramNames: [
				"hz",
				"offset",
				"trig"
			],
			paramModes: [
				"audio",
				"scalar",
				"audio"
			],
			emitNames: [],
			usesInput: false
		},
		{
			id: 75,
			genName: "Sine",
			variantName: "default",
			className: "Sine_default_hz_audio_offset_audio_trig_scalar",
			paramNames: [
				"hz",
				"offset",
				"trig"
			],
			paramModes: [
				"audio",
				"audio",
				"scalar"
			],
			emitNames: [],
			usesInput: false
		},
		{
			id: 76,
			genName: "Sine",
			variantName: "default",
			className: "Sine_default_hz_audio_offset_audio_trig_audio",
			paramNames: [
				"hz",
				"offset",
				"trig"
			],
			paramModes: [
				"audio",
				"audio",
				"audio"
			],
			emitNames: [],
			usesInput: false
		},
		{
			id: 77,
			genName: "Lfosine",
			variantName: "default",
			className: "Lfosine_default_bar_scalar_offset_scalar_trig_scalar",
			paramNames: [
				"bar",
				"offset",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 78,
			genName: "Lfosine",
			variantName: "default",
			className: "Lfosine_default_bar_scalar_offset_scalar_trig_audio",
			paramNames: [
				"bar",
				"offset",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"audio"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 79,
			genName: "Lfosine",
			variantName: "default",
			className: "Lfosine_default_bar_scalar_offset_audio_trig_scalar",
			paramNames: [
				"bar",
				"offset",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"scalar"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 80,
			genName: "Lfosine",
			variantName: "default",
			className: "Lfosine_default_bar_scalar_offset_audio_trig_audio",
			paramNames: [
				"bar",
				"offset",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"audio"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 81,
			genName: "Lfosine",
			variantName: "default",
			className: "Lfosine_default_bar_audio_offset_scalar_trig_scalar",
			paramNames: [
				"bar",
				"offset",
				"trig"
			],
			paramModes: [
				"audio",
				"scalar",
				"scalar"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 82,
			genName: "Lfosine",
			variantName: "default",
			className: "Lfosine_default_bar_audio_offset_scalar_trig_audio",
			paramNames: [
				"bar",
				"offset",
				"trig"
			],
			paramModes: [
				"audio",
				"scalar",
				"audio"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 83,
			genName: "Lfosine",
			variantName: "default",
			className: "Lfosine_default_bar_audio_offset_audio_trig_scalar",
			paramNames: [
				"bar",
				"offset",
				"trig"
			],
			paramModes: [
				"audio",
				"audio",
				"scalar"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 84,
			genName: "Lfosine",
			variantName: "default",
			className: "Lfosine_default_bar_audio_offset_audio_trig_audio",
			paramNames: [
				"bar",
				"offset",
				"trig"
			],
			paramModes: [
				"audio",
				"audio",
				"audio"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 85,
			genName: "Slicer",
			variantName: "default",
			className: "Slicer_default_sample_scalar_speed_scalar_offset_scalar_slice_scalar_threshold_scalar_repeat_scalar_trig_scalar",
			paramNames: [
				"sample",
				"speed",
				"offset",
				"slice",
				"threshold",
				"repeat",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: [
				"slicePosition",
				"slicePlaying",
				"currentSlice"
			],
			usesInput: false
		},
		{
			id: 86,
			genName: "Slicer",
			variantName: "default",
			className: "Slicer_default_sample_scalar_speed_scalar_offset_scalar_slice_scalar_threshold_scalar_repeat_scalar_trig_audio",
			paramNames: [
				"sample",
				"speed",
				"offset",
				"slice",
				"threshold",
				"repeat",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"audio"
			],
			emitNames: [
				"slicePosition",
				"slicePlaying",
				"currentSlice"
			],
			usesInput: false
		},
		{
			id: 87,
			genName: "Slicer",
			variantName: "default",
			className: "Slicer_default_sample_scalar_speed_scalar_offset_scalar_slice_scalar_threshold_scalar_repeat_audio_trig_scalar",
			paramNames: [
				"sample",
				"speed",
				"offset",
				"slice",
				"threshold",
				"repeat",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"audio",
				"scalar"
			],
			emitNames: [
				"slicePosition",
				"slicePlaying",
				"currentSlice"
			],
			usesInput: false
		},
		{
			id: 88,
			genName: "Slicer",
			variantName: "default",
			className: "Slicer_default_sample_scalar_speed_scalar_offset_scalar_slice_scalar_threshold_scalar_repeat_audio_trig_audio",
			paramNames: [
				"sample",
				"speed",
				"offset",
				"slice",
				"threshold",
				"repeat",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"audio",
				"audio"
			],
			emitNames: [
				"slicePosition",
				"slicePlaying",
				"currentSlice"
			],
			usesInput: false
		},
		{
			id: 89,
			genName: "Slicer",
			variantName: "default",
			className: "Slicer_default_sample_scalar_speed_scalar_offset_scalar_slice_audio_threshold_scalar_repeat_scalar_trig_scalar",
			paramNames: [
				"sample",
				"speed",
				"offset",
				"slice",
				"threshold",
				"repeat",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"scalar",
				"audio",
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: [
				"slicePosition",
				"slicePlaying",
				"currentSlice"
			],
			usesInput: false
		},
		{
			id: 90,
			genName: "Slicer",
			variantName: "default",
			className: "Slicer_default_sample_scalar_speed_scalar_offset_scalar_slice_audio_threshold_scalar_repeat_scalar_trig_audio",
			paramNames: [
				"sample",
				"speed",
				"offset",
				"slice",
				"threshold",
				"repeat",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"scalar",
				"audio",
				"scalar",
				"scalar",
				"audio"
			],
			emitNames: [
				"slicePosition",
				"slicePlaying",
				"currentSlice"
			],
			usesInput: false
		},
		{
			id: 91,
			genName: "Slicer",
			variantName: "default",
			className: "Slicer_default_sample_scalar_speed_scalar_offset_scalar_slice_audio_threshold_scalar_repeat_audio_trig_scalar",
			paramNames: [
				"sample",
				"speed",
				"offset",
				"slice",
				"threshold",
				"repeat",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"scalar",
				"audio",
				"scalar",
				"audio",
				"scalar"
			],
			emitNames: [
				"slicePosition",
				"slicePlaying",
				"currentSlice"
			],
			usesInput: false
		},
		{
			id: 92,
			genName: "Slicer",
			variantName: "default",
			className: "Slicer_default_sample_scalar_speed_scalar_offset_scalar_slice_audio_threshold_scalar_repeat_audio_trig_audio",
			paramNames: [
				"sample",
				"speed",
				"offset",
				"slice",
				"threshold",
				"repeat",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"scalar",
				"audio",
				"scalar",
				"audio",
				"audio"
			],
			emitNames: [
				"slicePosition",
				"slicePlaying",
				"currentSlice"
			],
			usesInput: false
		},
		{
			id: 93,
			genName: "Slicer",
			variantName: "default",
			className: "Slicer_default_sample_scalar_speed_scalar_offset_audio_slice_scalar_threshold_scalar_repeat_scalar_trig_scalar",
			paramNames: [
				"sample",
				"speed",
				"offset",
				"slice",
				"threshold",
				"repeat",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"audio",
				"scalar",
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: [
				"slicePosition",
				"slicePlaying",
				"currentSlice"
			],
			usesInput: false
		},
		{
			id: 94,
			genName: "Slicer",
			variantName: "default",
			className: "Slicer_default_sample_scalar_speed_scalar_offset_audio_slice_scalar_threshold_scalar_repeat_scalar_trig_audio",
			paramNames: [
				"sample",
				"speed",
				"offset",
				"slice",
				"threshold",
				"repeat",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"audio",
				"scalar",
				"scalar",
				"scalar",
				"audio"
			],
			emitNames: [
				"slicePosition",
				"slicePlaying",
				"currentSlice"
			],
			usesInput: false
		},
		{
			id: 95,
			genName: "Slicer",
			variantName: "default",
			className: "Slicer_default_sample_scalar_speed_scalar_offset_audio_slice_scalar_threshold_scalar_repeat_audio_trig_scalar",
			paramNames: [
				"sample",
				"speed",
				"offset",
				"slice",
				"threshold",
				"repeat",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"audio",
				"scalar",
				"scalar",
				"audio",
				"scalar"
			],
			emitNames: [
				"slicePosition",
				"slicePlaying",
				"currentSlice"
			],
			usesInput: false
		},
		{
			id: 96,
			genName: "Slicer",
			variantName: "default",
			className: "Slicer_default_sample_scalar_speed_scalar_offset_audio_slice_scalar_threshold_scalar_repeat_audio_trig_audio",
			paramNames: [
				"sample",
				"speed",
				"offset",
				"slice",
				"threshold",
				"repeat",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"audio",
				"scalar",
				"scalar",
				"audio",
				"audio"
			],
			emitNames: [
				"slicePosition",
				"slicePlaying",
				"currentSlice"
			],
			usesInput: false
		},
		{
			id: 97,
			genName: "Slicer",
			variantName: "default",
			className: "Slicer_default_sample_scalar_speed_scalar_offset_audio_slice_audio_threshold_scalar_repeat_scalar_trig_scalar",
			paramNames: [
				"sample",
				"speed",
				"offset",
				"slice",
				"threshold",
				"repeat",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"audio",
				"audio",
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: [
				"slicePosition",
				"slicePlaying",
				"currentSlice"
			],
			usesInput: false
		},
		{
			id: 98,
			genName: "Slicer",
			variantName: "default",
			className: "Slicer_default_sample_scalar_speed_scalar_offset_audio_slice_audio_threshold_scalar_repeat_scalar_trig_audio",
			paramNames: [
				"sample",
				"speed",
				"offset",
				"slice",
				"threshold",
				"repeat",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"audio",
				"audio",
				"scalar",
				"scalar",
				"audio"
			],
			emitNames: [
				"slicePosition",
				"slicePlaying",
				"currentSlice"
			],
			usesInput: false
		},
		{
			id: 99,
			genName: "Slicer",
			variantName: "default",
			className: "Slicer_default_sample_scalar_speed_scalar_offset_audio_slice_audio_threshold_scalar_repeat_audio_trig_scalar",
			paramNames: [
				"sample",
				"speed",
				"offset",
				"slice",
				"threshold",
				"repeat",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"audio",
				"audio",
				"scalar",
				"audio",
				"scalar"
			],
			emitNames: [
				"slicePosition",
				"slicePlaying",
				"currentSlice"
			],
			usesInput: false
		},
		{
			id: 100,
			genName: "Slicer",
			variantName: "default",
			className: "Slicer_default_sample_scalar_speed_scalar_offset_audio_slice_audio_threshold_scalar_repeat_audio_trig_audio",
			paramNames: [
				"sample",
				"speed",
				"offset",
				"slice",
				"threshold",
				"repeat",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"audio",
				"audio",
				"scalar",
				"audio",
				"audio"
			],
			emitNames: [
				"slicePosition",
				"slicePlaying",
				"currentSlice"
			],
			usesInput: false
		},
		{
			id: 101,
			genName: "Slicer",
			variantName: "default",
			className: "Slicer_default_sample_scalar_speed_audio_offset_scalar_slice_scalar_threshold_scalar_repeat_scalar_trig_scalar",
			paramNames: [
				"sample",
				"speed",
				"offset",
				"slice",
				"threshold",
				"repeat",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: [
				"slicePosition",
				"slicePlaying",
				"currentSlice"
			],
			usesInput: false
		},
		{
			id: 102,
			genName: "Slicer",
			variantName: "default",
			className: "Slicer_default_sample_scalar_speed_audio_offset_scalar_slice_scalar_threshold_scalar_repeat_scalar_trig_audio",
			paramNames: [
				"sample",
				"speed",
				"offset",
				"slice",
				"threshold",
				"repeat",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"audio"
			],
			emitNames: [
				"slicePosition",
				"slicePlaying",
				"currentSlice"
			],
			usesInput: false
		},
		{
			id: 103,
			genName: "Slicer",
			variantName: "default",
			className: "Slicer_default_sample_scalar_speed_audio_offset_scalar_slice_scalar_threshold_scalar_repeat_audio_trig_scalar",
			paramNames: [
				"sample",
				"speed",
				"offset",
				"slice",
				"threshold",
				"repeat",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"scalar",
				"scalar",
				"scalar",
				"audio",
				"scalar"
			],
			emitNames: [
				"slicePosition",
				"slicePlaying",
				"currentSlice"
			],
			usesInput: false
		},
		{
			id: 104,
			genName: "Slicer",
			variantName: "default",
			className: "Slicer_default_sample_scalar_speed_audio_offset_scalar_slice_scalar_threshold_scalar_repeat_audio_trig_audio",
			paramNames: [
				"sample",
				"speed",
				"offset",
				"slice",
				"threshold",
				"repeat",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"scalar",
				"scalar",
				"scalar",
				"audio",
				"audio"
			],
			emitNames: [
				"slicePosition",
				"slicePlaying",
				"currentSlice"
			],
			usesInput: false
		},
		{
			id: 105,
			genName: "Slicer",
			variantName: "default",
			className: "Slicer_default_sample_scalar_speed_audio_offset_scalar_slice_audio_threshold_scalar_repeat_scalar_trig_scalar",
			paramNames: [
				"sample",
				"speed",
				"offset",
				"slice",
				"threshold",
				"repeat",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"scalar",
				"audio",
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: [
				"slicePosition",
				"slicePlaying",
				"currentSlice"
			],
			usesInput: false
		},
		{
			id: 106,
			genName: "Slicer",
			variantName: "default",
			className: "Slicer_default_sample_scalar_speed_audio_offset_scalar_slice_audio_threshold_scalar_repeat_scalar_trig_audio",
			paramNames: [
				"sample",
				"speed",
				"offset",
				"slice",
				"threshold",
				"repeat",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"scalar",
				"audio",
				"scalar",
				"scalar",
				"audio"
			],
			emitNames: [
				"slicePosition",
				"slicePlaying",
				"currentSlice"
			],
			usesInput: false
		},
		{
			id: 107,
			genName: "Slicer",
			variantName: "default",
			className: "Slicer_default_sample_scalar_speed_audio_offset_scalar_slice_audio_threshold_scalar_repeat_audio_trig_scalar",
			paramNames: [
				"sample",
				"speed",
				"offset",
				"slice",
				"threshold",
				"repeat",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"scalar",
				"audio",
				"scalar",
				"audio",
				"scalar"
			],
			emitNames: [
				"slicePosition",
				"slicePlaying",
				"currentSlice"
			],
			usesInput: false
		},
		{
			id: 108,
			genName: "Slicer",
			variantName: "default",
			className: "Slicer_default_sample_scalar_speed_audio_offset_scalar_slice_audio_threshold_scalar_repeat_audio_trig_audio",
			paramNames: [
				"sample",
				"speed",
				"offset",
				"slice",
				"threshold",
				"repeat",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"scalar",
				"audio",
				"scalar",
				"audio",
				"audio"
			],
			emitNames: [
				"slicePosition",
				"slicePlaying",
				"currentSlice"
			],
			usesInput: false
		},
		{
			id: 109,
			genName: "Slicer",
			variantName: "default",
			className: "Slicer_default_sample_scalar_speed_audio_offset_audio_slice_scalar_threshold_scalar_repeat_scalar_trig_scalar",
			paramNames: [
				"sample",
				"speed",
				"offset",
				"slice",
				"threshold",
				"repeat",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"audio",
				"scalar",
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: [
				"slicePosition",
				"slicePlaying",
				"currentSlice"
			],
			usesInput: false
		},
		{
			id: 110,
			genName: "Slicer",
			variantName: "default",
			className: "Slicer_default_sample_scalar_speed_audio_offset_audio_slice_scalar_threshold_scalar_repeat_scalar_trig_audio",
			paramNames: [
				"sample",
				"speed",
				"offset",
				"slice",
				"threshold",
				"repeat",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"audio",
				"scalar",
				"scalar",
				"scalar",
				"audio"
			],
			emitNames: [
				"slicePosition",
				"slicePlaying",
				"currentSlice"
			],
			usesInput: false
		},
		{
			id: 111,
			genName: "Slicer",
			variantName: "default",
			className: "Slicer_default_sample_scalar_speed_audio_offset_audio_slice_scalar_threshold_scalar_repeat_audio_trig_scalar",
			paramNames: [
				"sample",
				"speed",
				"offset",
				"slice",
				"threshold",
				"repeat",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"audio",
				"scalar",
				"scalar",
				"audio",
				"scalar"
			],
			emitNames: [
				"slicePosition",
				"slicePlaying",
				"currentSlice"
			],
			usesInput: false
		},
		{
			id: 112,
			genName: "Slicer",
			variantName: "default",
			className: "Slicer_default_sample_scalar_speed_audio_offset_audio_slice_scalar_threshold_scalar_repeat_audio_trig_audio",
			paramNames: [
				"sample",
				"speed",
				"offset",
				"slice",
				"threshold",
				"repeat",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"audio",
				"scalar",
				"scalar",
				"audio",
				"audio"
			],
			emitNames: [
				"slicePosition",
				"slicePlaying",
				"currentSlice"
			],
			usesInput: false
		},
		{
			id: 113,
			genName: "Slicer",
			variantName: "default",
			className: "Slicer_default_sample_scalar_speed_audio_offset_audio_slice_audio_threshold_scalar_repeat_scalar_trig_scalar",
			paramNames: [
				"sample",
				"speed",
				"offset",
				"slice",
				"threshold",
				"repeat",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"audio",
				"audio",
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: [
				"slicePosition",
				"slicePlaying",
				"currentSlice"
			],
			usesInput: false
		},
		{
			id: 114,
			genName: "Slicer",
			variantName: "default",
			className: "Slicer_default_sample_scalar_speed_audio_offset_audio_slice_audio_threshold_scalar_repeat_scalar_trig_audio",
			paramNames: [
				"sample",
				"speed",
				"offset",
				"slice",
				"threshold",
				"repeat",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"audio",
				"audio",
				"scalar",
				"scalar",
				"audio"
			],
			emitNames: [
				"slicePosition",
				"slicePlaying",
				"currentSlice"
			],
			usesInput: false
		},
		{
			id: 115,
			genName: "Slicer",
			variantName: "default",
			className: "Slicer_default_sample_scalar_speed_audio_offset_audio_slice_audio_threshold_scalar_repeat_audio_trig_scalar",
			paramNames: [
				"sample",
				"speed",
				"offset",
				"slice",
				"threshold",
				"repeat",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"audio",
				"audio",
				"scalar",
				"audio",
				"scalar"
			],
			emitNames: [
				"slicePosition",
				"slicePlaying",
				"currentSlice"
			],
			usesInput: false
		},
		{
			id: 116,
			genName: "Slicer",
			variantName: "default",
			className: "Slicer_default_sample_scalar_speed_audio_offset_audio_slice_audio_threshold_scalar_repeat_audio_trig_audio",
			paramNames: [
				"sample",
				"speed",
				"offset",
				"slice",
				"threshold",
				"repeat",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"audio",
				"audio",
				"scalar",
				"audio",
				"audio"
			],
			emitNames: [
				"slicePosition",
				"slicePlaying",
				"currentSlice"
			],
			usesInput: false
		},
		{
			id: 117,
			genName: "Slicer",
			variantName: "default",
			className: "Slicer_default_sample_scalar_speed_scalar_offset_scalar_slice_scalar_threshold_scalar_repeat_scalar_trig_scalar_stereo",
			paramNames: [
				"sample",
				"speed",
				"offset",
				"slice",
				"threshold",
				"repeat",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: [
				"slicePosition",
				"slicePlaying",
				"currentSlice"
			],
			usesInput: false
		},
		{
			id: 118,
			genName: "Slicer",
			variantName: "default",
			className: "Slicer_default_sample_scalar_speed_scalar_offset_scalar_slice_scalar_threshold_scalar_repeat_scalar_trig_audio_stereo",
			paramNames: [
				"sample",
				"speed",
				"offset",
				"slice",
				"threshold",
				"repeat",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"audio"
			],
			emitNames: [
				"slicePosition",
				"slicePlaying",
				"currentSlice"
			],
			usesInput: false
		},
		{
			id: 119,
			genName: "Slicer",
			variantName: "default",
			className: "Slicer_default_sample_scalar_speed_scalar_offset_scalar_slice_scalar_threshold_scalar_repeat_audio_trig_scalar_stereo",
			paramNames: [
				"sample",
				"speed",
				"offset",
				"slice",
				"threshold",
				"repeat",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"audio",
				"scalar"
			],
			emitNames: [
				"slicePosition",
				"slicePlaying",
				"currentSlice"
			],
			usesInput: false
		},
		{
			id: 120,
			genName: "Slicer",
			variantName: "default",
			className: "Slicer_default_sample_scalar_speed_scalar_offset_scalar_slice_scalar_threshold_scalar_repeat_audio_trig_audio_stereo",
			paramNames: [
				"sample",
				"speed",
				"offset",
				"slice",
				"threshold",
				"repeat",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"audio",
				"audio"
			],
			emitNames: [
				"slicePosition",
				"slicePlaying",
				"currentSlice"
			],
			usesInput: false
		},
		{
			id: 121,
			genName: "Slicer",
			variantName: "default",
			className: "Slicer_default_sample_scalar_speed_scalar_offset_scalar_slice_audio_threshold_scalar_repeat_scalar_trig_scalar_stereo",
			paramNames: [
				"sample",
				"speed",
				"offset",
				"slice",
				"threshold",
				"repeat",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"scalar",
				"audio",
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: [
				"slicePosition",
				"slicePlaying",
				"currentSlice"
			],
			usesInput: false
		},
		{
			id: 122,
			genName: "Slicer",
			variantName: "default",
			className: "Slicer_default_sample_scalar_speed_scalar_offset_scalar_slice_audio_threshold_scalar_repeat_scalar_trig_audio_stereo",
			paramNames: [
				"sample",
				"speed",
				"offset",
				"slice",
				"threshold",
				"repeat",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"scalar",
				"audio",
				"scalar",
				"scalar",
				"audio"
			],
			emitNames: [
				"slicePosition",
				"slicePlaying",
				"currentSlice"
			],
			usesInput: false
		},
		{
			id: 123,
			genName: "Slicer",
			variantName: "default",
			className: "Slicer_default_sample_scalar_speed_scalar_offset_scalar_slice_audio_threshold_scalar_repeat_audio_trig_scalar_stereo",
			paramNames: [
				"sample",
				"speed",
				"offset",
				"slice",
				"threshold",
				"repeat",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"scalar",
				"audio",
				"scalar",
				"audio",
				"scalar"
			],
			emitNames: [
				"slicePosition",
				"slicePlaying",
				"currentSlice"
			],
			usesInput: false
		},
		{
			id: 124,
			genName: "Slicer",
			variantName: "default",
			className: "Slicer_default_sample_scalar_speed_scalar_offset_scalar_slice_audio_threshold_scalar_repeat_audio_trig_audio_stereo",
			paramNames: [
				"sample",
				"speed",
				"offset",
				"slice",
				"threshold",
				"repeat",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"scalar",
				"audio",
				"scalar",
				"audio",
				"audio"
			],
			emitNames: [
				"slicePosition",
				"slicePlaying",
				"currentSlice"
			],
			usesInput: false
		},
		{
			id: 125,
			genName: "Slicer",
			variantName: "default",
			className: "Slicer_default_sample_scalar_speed_scalar_offset_audio_slice_scalar_threshold_scalar_repeat_scalar_trig_scalar_stereo",
			paramNames: [
				"sample",
				"speed",
				"offset",
				"slice",
				"threshold",
				"repeat",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"audio",
				"scalar",
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: [
				"slicePosition",
				"slicePlaying",
				"currentSlice"
			],
			usesInput: false
		},
		{
			id: 126,
			genName: "Slicer",
			variantName: "default",
			className: "Slicer_default_sample_scalar_speed_scalar_offset_audio_slice_scalar_threshold_scalar_repeat_scalar_trig_audio_stereo",
			paramNames: [
				"sample",
				"speed",
				"offset",
				"slice",
				"threshold",
				"repeat",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"audio",
				"scalar",
				"scalar",
				"scalar",
				"audio"
			],
			emitNames: [
				"slicePosition",
				"slicePlaying",
				"currentSlice"
			],
			usesInput: false
		},
		{
			id: 127,
			genName: "Slicer",
			variantName: "default",
			className: "Slicer_default_sample_scalar_speed_scalar_offset_audio_slice_scalar_threshold_scalar_repeat_audio_trig_scalar_stereo",
			paramNames: [
				"sample",
				"speed",
				"offset",
				"slice",
				"threshold",
				"repeat",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"audio",
				"scalar",
				"scalar",
				"audio",
				"scalar"
			],
			emitNames: [
				"slicePosition",
				"slicePlaying",
				"currentSlice"
			],
			usesInput: false
		},
		{
			id: 128,
			genName: "Slicer",
			variantName: "default",
			className: "Slicer_default_sample_scalar_speed_scalar_offset_audio_slice_scalar_threshold_scalar_repeat_audio_trig_audio_stereo",
			paramNames: [
				"sample",
				"speed",
				"offset",
				"slice",
				"threshold",
				"repeat",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"audio",
				"scalar",
				"scalar",
				"audio",
				"audio"
			],
			emitNames: [
				"slicePosition",
				"slicePlaying",
				"currentSlice"
			],
			usesInput: false
		},
		{
			id: 129,
			genName: "Slicer",
			variantName: "default",
			className: "Slicer_default_sample_scalar_speed_scalar_offset_audio_slice_audio_threshold_scalar_repeat_scalar_trig_scalar_stereo",
			paramNames: [
				"sample",
				"speed",
				"offset",
				"slice",
				"threshold",
				"repeat",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"audio",
				"audio",
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: [
				"slicePosition",
				"slicePlaying",
				"currentSlice"
			],
			usesInput: false
		},
		{
			id: 130,
			genName: "Slicer",
			variantName: "default",
			className: "Slicer_default_sample_scalar_speed_scalar_offset_audio_slice_audio_threshold_scalar_repeat_scalar_trig_audio_stereo",
			paramNames: [
				"sample",
				"speed",
				"offset",
				"slice",
				"threshold",
				"repeat",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"audio",
				"audio",
				"scalar",
				"scalar",
				"audio"
			],
			emitNames: [
				"slicePosition",
				"slicePlaying",
				"currentSlice"
			],
			usesInput: false
		},
		{
			id: 131,
			genName: "Slicer",
			variantName: "default",
			className: "Slicer_default_sample_scalar_speed_scalar_offset_audio_slice_audio_threshold_scalar_repeat_audio_trig_scalar_stereo",
			paramNames: [
				"sample",
				"speed",
				"offset",
				"slice",
				"threshold",
				"repeat",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"audio",
				"audio",
				"scalar",
				"audio",
				"scalar"
			],
			emitNames: [
				"slicePosition",
				"slicePlaying",
				"currentSlice"
			],
			usesInput: false
		},
		{
			id: 132,
			genName: "Slicer",
			variantName: "default",
			className: "Slicer_default_sample_scalar_speed_scalar_offset_audio_slice_audio_threshold_scalar_repeat_audio_trig_audio_stereo",
			paramNames: [
				"sample",
				"speed",
				"offset",
				"slice",
				"threshold",
				"repeat",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"audio",
				"audio",
				"scalar",
				"audio",
				"audio"
			],
			emitNames: [
				"slicePosition",
				"slicePlaying",
				"currentSlice"
			],
			usesInput: false
		},
		{
			id: 133,
			genName: "Slicer",
			variantName: "default",
			className: "Slicer_default_sample_scalar_speed_audio_offset_scalar_slice_scalar_threshold_scalar_repeat_scalar_trig_scalar_stereo",
			paramNames: [
				"sample",
				"speed",
				"offset",
				"slice",
				"threshold",
				"repeat",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: [
				"slicePosition",
				"slicePlaying",
				"currentSlice"
			],
			usesInput: false
		},
		{
			id: 134,
			genName: "Slicer",
			variantName: "default",
			className: "Slicer_default_sample_scalar_speed_audio_offset_scalar_slice_scalar_threshold_scalar_repeat_scalar_trig_audio_stereo",
			paramNames: [
				"sample",
				"speed",
				"offset",
				"slice",
				"threshold",
				"repeat",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"audio"
			],
			emitNames: [
				"slicePosition",
				"slicePlaying",
				"currentSlice"
			],
			usesInput: false
		},
		{
			id: 135,
			genName: "Slicer",
			variantName: "default",
			className: "Slicer_default_sample_scalar_speed_audio_offset_scalar_slice_scalar_threshold_scalar_repeat_audio_trig_scalar_stereo",
			paramNames: [
				"sample",
				"speed",
				"offset",
				"slice",
				"threshold",
				"repeat",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"scalar",
				"scalar",
				"scalar",
				"audio",
				"scalar"
			],
			emitNames: [
				"slicePosition",
				"slicePlaying",
				"currentSlice"
			],
			usesInput: false
		},
		{
			id: 136,
			genName: "Slicer",
			variantName: "default",
			className: "Slicer_default_sample_scalar_speed_audio_offset_scalar_slice_scalar_threshold_scalar_repeat_audio_trig_audio_stereo",
			paramNames: [
				"sample",
				"speed",
				"offset",
				"slice",
				"threshold",
				"repeat",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"scalar",
				"scalar",
				"scalar",
				"audio",
				"audio"
			],
			emitNames: [
				"slicePosition",
				"slicePlaying",
				"currentSlice"
			],
			usesInput: false
		},
		{
			id: 137,
			genName: "Slicer",
			variantName: "default",
			className: "Slicer_default_sample_scalar_speed_audio_offset_scalar_slice_audio_threshold_scalar_repeat_scalar_trig_scalar_stereo",
			paramNames: [
				"sample",
				"speed",
				"offset",
				"slice",
				"threshold",
				"repeat",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"scalar",
				"audio",
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: [
				"slicePosition",
				"slicePlaying",
				"currentSlice"
			],
			usesInput: false
		},
		{
			id: 138,
			genName: "Slicer",
			variantName: "default",
			className: "Slicer_default_sample_scalar_speed_audio_offset_scalar_slice_audio_threshold_scalar_repeat_scalar_trig_audio_stereo",
			paramNames: [
				"sample",
				"speed",
				"offset",
				"slice",
				"threshold",
				"repeat",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"scalar",
				"audio",
				"scalar",
				"scalar",
				"audio"
			],
			emitNames: [
				"slicePosition",
				"slicePlaying",
				"currentSlice"
			],
			usesInput: false
		},
		{
			id: 139,
			genName: "Slicer",
			variantName: "default",
			className: "Slicer_default_sample_scalar_speed_audio_offset_scalar_slice_audio_threshold_scalar_repeat_audio_trig_scalar_stereo",
			paramNames: [
				"sample",
				"speed",
				"offset",
				"slice",
				"threshold",
				"repeat",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"scalar",
				"audio",
				"scalar",
				"audio",
				"scalar"
			],
			emitNames: [
				"slicePosition",
				"slicePlaying",
				"currentSlice"
			],
			usesInput: false
		},
		{
			id: 140,
			genName: "Slicer",
			variantName: "default",
			className: "Slicer_default_sample_scalar_speed_audio_offset_scalar_slice_audio_threshold_scalar_repeat_audio_trig_audio_stereo",
			paramNames: [
				"sample",
				"speed",
				"offset",
				"slice",
				"threshold",
				"repeat",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"scalar",
				"audio",
				"scalar",
				"audio",
				"audio"
			],
			emitNames: [
				"slicePosition",
				"slicePlaying",
				"currentSlice"
			],
			usesInput: false
		},
		{
			id: 141,
			genName: "Slicer",
			variantName: "default",
			className: "Slicer_default_sample_scalar_speed_audio_offset_audio_slice_scalar_threshold_scalar_repeat_scalar_trig_scalar_stereo",
			paramNames: [
				"sample",
				"speed",
				"offset",
				"slice",
				"threshold",
				"repeat",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"audio",
				"scalar",
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: [
				"slicePosition",
				"slicePlaying",
				"currentSlice"
			],
			usesInput: false
		},
		{
			id: 142,
			genName: "Slicer",
			variantName: "default",
			className: "Slicer_default_sample_scalar_speed_audio_offset_audio_slice_scalar_threshold_scalar_repeat_scalar_trig_audio_stereo",
			paramNames: [
				"sample",
				"speed",
				"offset",
				"slice",
				"threshold",
				"repeat",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"audio",
				"scalar",
				"scalar",
				"scalar",
				"audio"
			],
			emitNames: [
				"slicePosition",
				"slicePlaying",
				"currentSlice"
			],
			usesInput: false
		},
		{
			id: 143,
			genName: "Slicer",
			variantName: "default",
			className: "Slicer_default_sample_scalar_speed_audio_offset_audio_slice_scalar_threshold_scalar_repeat_audio_trig_scalar_stereo",
			paramNames: [
				"sample",
				"speed",
				"offset",
				"slice",
				"threshold",
				"repeat",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"audio",
				"scalar",
				"scalar",
				"audio",
				"scalar"
			],
			emitNames: [
				"slicePosition",
				"slicePlaying",
				"currentSlice"
			],
			usesInput: false
		},
		{
			id: 144,
			genName: "Slicer",
			variantName: "default",
			className: "Slicer_default_sample_scalar_speed_audio_offset_audio_slice_scalar_threshold_scalar_repeat_audio_trig_audio_stereo",
			paramNames: [
				"sample",
				"speed",
				"offset",
				"slice",
				"threshold",
				"repeat",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"audio",
				"scalar",
				"scalar",
				"audio",
				"audio"
			],
			emitNames: [
				"slicePosition",
				"slicePlaying",
				"currentSlice"
			],
			usesInput: false
		},
		{
			id: 145,
			genName: "Slicer",
			variantName: "default",
			className: "Slicer_default_sample_scalar_speed_audio_offset_audio_slice_audio_threshold_scalar_repeat_scalar_trig_scalar_stereo",
			paramNames: [
				"sample",
				"speed",
				"offset",
				"slice",
				"threshold",
				"repeat",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"audio",
				"audio",
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: [
				"slicePosition",
				"slicePlaying",
				"currentSlice"
			],
			usesInput: false
		},
		{
			id: 146,
			genName: "Slicer",
			variantName: "default",
			className: "Slicer_default_sample_scalar_speed_audio_offset_audio_slice_audio_threshold_scalar_repeat_scalar_trig_audio_stereo",
			paramNames: [
				"sample",
				"speed",
				"offset",
				"slice",
				"threshold",
				"repeat",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"audio",
				"audio",
				"scalar",
				"scalar",
				"audio"
			],
			emitNames: [
				"slicePosition",
				"slicePlaying",
				"currentSlice"
			],
			usesInput: false
		},
		{
			id: 147,
			genName: "Slicer",
			variantName: "default",
			className: "Slicer_default_sample_scalar_speed_audio_offset_audio_slice_audio_threshold_scalar_repeat_audio_trig_scalar_stereo",
			paramNames: [
				"sample",
				"speed",
				"offset",
				"slice",
				"threshold",
				"repeat",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"audio",
				"audio",
				"scalar",
				"audio",
				"scalar"
			],
			emitNames: [
				"slicePosition",
				"slicePlaying",
				"currentSlice"
			],
			usesInput: false
		},
		{
			id: 148,
			genName: "Slicer",
			variantName: "default",
			className: "Slicer_default_sample_scalar_speed_audio_offset_audio_slice_audio_threshold_scalar_repeat_audio_trig_audio_stereo",
			paramNames: [
				"sample",
				"speed",
				"offset",
				"slice",
				"threshold",
				"repeat",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"audio",
				"audio",
				"scalar",
				"audio",
				"audio"
			],
			emitNames: [
				"slicePosition",
				"slicePlaying",
				"currentSlice"
			],
			usesInput: false
		},
		{
			id: 149,
			genName: "Brown",
			variantName: "default",
			className: "Brown_default_seed_scalar_trig_scalar",
			paramNames: ["seed", "trig"],
			paramModes: ["scalar", "scalar"],
			emitNames: [],
			usesInput: false
		},
		{
			id: 150,
			genName: "Brown",
			variantName: "default",
			className: "Brown_default_seed_scalar_trig_audio",
			paramNames: ["seed", "trig"],
			paramModes: ["scalar", "audio"],
			emitNames: [],
			usesInput: false
		},
		{
			id: 151,
			genName: "Euclid",
			variantName: "default",
			className: "Euclid_default_pulses_scalar_steps_scalar_offset_scalar_bar_scalar",
			paramNames: [
				"pulses",
				"steps",
				"offset",
				"bar"
			],
			paramModes: [
				"scalar",
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: [],
			usesInput: false
		},
		{
			id: 152,
			genName: "Euclid",
			variantName: "default",
			className: "Euclid_default_pulses_scalar_steps_scalar_offset_scalar_bar_audio",
			paramNames: [
				"pulses",
				"steps",
				"offset",
				"bar"
			],
			paramModes: [
				"scalar",
				"scalar",
				"scalar",
				"audio"
			],
			emitNames: [],
			usesInput: false
		},
		{
			id: 153,
			genName: "Euclid",
			variantName: "default",
			className: "Euclid_default_pulses_scalar_steps_scalar_offset_audio_bar_scalar",
			paramNames: [
				"pulses",
				"steps",
				"offset",
				"bar"
			],
			paramModes: [
				"scalar",
				"scalar",
				"audio",
				"scalar"
			],
			emitNames: [],
			usesInput: false
		},
		{
			id: 154,
			genName: "Euclid",
			variantName: "default",
			className: "Euclid_default_pulses_scalar_steps_scalar_offset_audio_bar_audio",
			paramNames: [
				"pulses",
				"steps",
				"offset",
				"bar"
			],
			paramModes: [
				"scalar",
				"scalar",
				"audio",
				"audio"
			],
			emitNames: [],
			usesInput: false
		},
		{
			id: 155,
			genName: "Euclid",
			variantName: "default",
			className: "Euclid_default_pulses_scalar_steps_audio_offset_scalar_bar_scalar",
			paramNames: [
				"pulses",
				"steps",
				"offset",
				"bar"
			],
			paramModes: [
				"scalar",
				"audio",
				"scalar",
				"scalar"
			],
			emitNames: [],
			usesInput: false
		},
		{
			id: 156,
			genName: "Euclid",
			variantName: "default",
			className: "Euclid_default_pulses_scalar_steps_audio_offset_scalar_bar_audio",
			paramNames: [
				"pulses",
				"steps",
				"offset",
				"bar"
			],
			paramModes: [
				"scalar",
				"audio",
				"scalar",
				"audio"
			],
			emitNames: [],
			usesInput: false
		},
		{
			id: 157,
			genName: "Euclid",
			variantName: "default",
			className: "Euclid_default_pulses_scalar_steps_audio_offset_audio_bar_scalar",
			paramNames: [
				"pulses",
				"steps",
				"offset",
				"bar"
			],
			paramModes: [
				"scalar",
				"audio",
				"audio",
				"scalar"
			],
			emitNames: [],
			usesInput: false
		},
		{
			id: 158,
			genName: "Euclid",
			variantName: "default",
			className: "Euclid_default_pulses_scalar_steps_audio_offset_audio_bar_audio",
			paramNames: [
				"pulses",
				"steps",
				"offset",
				"bar"
			],
			paramModes: [
				"scalar",
				"audio",
				"audio",
				"audio"
			],
			emitNames: [],
			usesInput: false
		},
		{
			id: 159,
			genName: "Euclid",
			variantName: "default",
			className: "Euclid_default_pulses_audio_steps_scalar_offset_scalar_bar_scalar",
			paramNames: [
				"pulses",
				"steps",
				"offset",
				"bar"
			],
			paramModes: [
				"audio",
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: [],
			usesInput: false
		},
		{
			id: 160,
			genName: "Euclid",
			variantName: "default",
			className: "Euclid_default_pulses_audio_steps_scalar_offset_scalar_bar_audio",
			paramNames: [
				"pulses",
				"steps",
				"offset",
				"bar"
			],
			paramModes: [
				"audio",
				"scalar",
				"scalar",
				"audio"
			],
			emitNames: [],
			usesInput: false
		},
		{
			id: 161,
			genName: "Euclid",
			variantName: "default",
			className: "Euclid_default_pulses_audio_steps_scalar_offset_audio_bar_scalar",
			paramNames: [
				"pulses",
				"steps",
				"offset",
				"bar"
			],
			paramModes: [
				"audio",
				"scalar",
				"audio",
				"scalar"
			],
			emitNames: [],
			usesInput: false
		},
		{
			id: 162,
			genName: "Euclid",
			variantName: "default",
			className: "Euclid_default_pulses_audio_steps_scalar_offset_audio_bar_audio",
			paramNames: [
				"pulses",
				"steps",
				"offset",
				"bar"
			],
			paramModes: [
				"audio",
				"scalar",
				"audio",
				"audio"
			],
			emitNames: [],
			usesInput: false
		},
		{
			id: 163,
			genName: "Euclid",
			variantName: "default",
			className: "Euclid_default_pulses_audio_steps_audio_offset_scalar_bar_scalar",
			paramNames: [
				"pulses",
				"steps",
				"offset",
				"bar"
			],
			paramModes: [
				"audio",
				"audio",
				"scalar",
				"scalar"
			],
			emitNames: [],
			usesInput: false
		},
		{
			id: 164,
			genName: "Euclid",
			variantName: "default",
			className: "Euclid_default_pulses_audio_steps_audio_offset_scalar_bar_audio",
			paramNames: [
				"pulses",
				"steps",
				"offset",
				"bar"
			],
			paramModes: [
				"audio",
				"audio",
				"scalar",
				"audio"
			],
			emitNames: [],
			usesInput: false
		},
		{
			id: 165,
			genName: "Euclid",
			variantName: "default",
			className: "Euclid_default_pulses_audio_steps_audio_offset_audio_bar_scalar",
			paramNames: [
				"pulses",
				"steps",
				"offset",
				"bar"
			],
			paramModes: [
				"audio",
				"audio",
				"audio",
				"scalar"
			],
			emitNames: [],
			usesInput: false
		},
		{
			id: 166,
			genName: "Euclid",
			variantName: "default",
			className: "Euclid_default_pulses_audio_steps_audio_offset_audio_bar_audio",
			paramNames: [
				"pulses",
				"steps",
				"offset",
				"bar"
			],
			paramModes: [
				"audio",
				"audio",
				"audio",
				"audio"
			],
			emitNames: [],
			usesInput: false
		},
		{
			id: 167,
			genName: "Pwm",
			variantName: "default",
			className: "Pwm_default_hz_scalar_width_scalar_offset_scalar_trig_scalar",
			paramNames: [
				"hz",
				"width",
				"offset",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: [],
			usesInput: false
		},
		{
			id: 168,
			genName: "Pwm",
			variantName: "default",
			className: "Pwm_default_hz_scalar_width_scalar_offset_scalar_trig_audio",
			paramNames: [
				"hz",
				"width",
				"offset",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"scalar",
				"audio"
			],
			emitNames: [],
			usesInput: false
		},
		{
			id: 169,
			genName: "Pwm",
			variantName: "default",
			className: "Pwm_default_hz_scalar_width_scalar_offset_audio_trig_scalar",
			paramNames: [
				"hz",
				"width",
				"offset",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"audio",
				"scalar"
			],
			emitNames: [],
			usesInput: false
		},
		{
			id: 170,
			genName: "Pwm",
			variantName: "default",
			className: "Pwm_default_hz_scalar_width_scalar_offset_audio_trig_audio",
			paramNames: [
				"hz",
				"width",
				"offset",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"audio",
				"audio"
			],
			emitNames: [],
			usesInput: false
		},
		{
			id: 171,
			genName: "Pwm",
			variantName: "default",
			className: "Pwm_default_hz_scalar_width_audio_offset_scalar_trig_scalar",
			paramNames: [
				"hz",
				"width",
				"offset",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"scalar",
				"scalar"
			],
			emitNames: [],
			usesInput: false
		},
		{
			id: 172,
			genName: "Pwm",
			variantName: "default",
			className: "Pwm_default_hz_scalar_width_audio_offset_scalar_trig_audio",
			paramNames: [
				"hz",
				"width",
				"offset",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"scalar",
				"audio"
			],
			emitNames: [],
			usesInput: false
		},
		{
			id: 173,
			genName: "Pwm",
			variantName: "default",
			className: "Pwm_default_hz_scalar_width_audio_offset_audio_trig_scalar",
			paramNames: [
				"hz",
				"width",
				"offset",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"audio",
				"scalar"
			],
			emitNames: [],
			usesInput: false
		},
		{
			id: 174,
			genName: "Pwm",
			variantName: "default",
			className: "Pwm_default_hz_scalar_width_audio_offset_audio_trig_audio",
			paramNames: [
				"hz",
				"width",
				"offset",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"audio",
				"audio"
			],
			emitNames: [],
			usesInput: false
		},
		{
			id: 175,
			genName: "Pwm",
			variantName: "default",
			className: "Pwm_default_hz_audio_width_scalar_offset_scalar_trig_scalar",
			paramNames: [
				"hz",
				"width",
				"offset",
				"trig"
			],
			paramModes: [
				"audio",
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: [],
			usesInput: false
		},
		{
			id: 176,
			genName: "Pwm",
			variantName: "default",
			className: "Pwm_default_hz_audio_width_scalar_offset_scalar_trig_audio",
			paramNames: [
				"hz",
				"width",
				"offset",
				"trig"
			],
			paramModes: [
				"audio",
				"scalar",
				"scalar",
				"audio"
			],
			emitNames: [],
			usesInput: false
		},
		{
			id: 177,
			genName: "Pwm",
			variantName: "default",
			className: "Pwm_default_hz_audio_width_scalar_offset_audio_trig_scalar",
			paramNames: [
				"hz",
				"width",
				"offset",
				"trig"
			],
			paramModes: [
				"audio",
				"scalar",
				"audio",
				"scalar"
			],
			emitNames: [],
			usesInput: false
		},
		{
			id: 178,
			genName: "Pwm",
			variantName: "default",
			className: "Pwm_default_hz_audio_width_scalar_offset_audio_trig_audio",
			paramNames: [
				"hz",
				"width",
				"offset",
				"trig"
			],
			paramModes: [
				"audio",
				"scalar",
				"audio",
				"audio"
			],
			emitNames: [],
			usesInput: false
		},
		{
			id: 179,
			genName: "Pwm",
			variantName: "default",
			className: "Pwm_default_hz_audio_width_audio_offset_scalar_trig_scalar",
			paramNames: [
				"hz",
				"width",
				"offset",
				"trig"
			],
			paramModes: [
				"audio",
				"audio",
				"scalar",
				"scalar"
			],
			emitNames: [],
			usesInput: false
		},
		{
			id: 180,
			genName: "Pwm",
			variantName: "default",
			className: "Pwm_default_hz_audio_width_audio_offset_scalar_trig_audio",
			paramNames: [
				"hz",
				"width",
				"offset",
				"trig"
			],
			paramModes: [
				"audio",
				"audio",
				"scalar",
				"audio"
			],
			emitNames: [],
			usesInput: false
		},
		{
			id: 181,
			genName: "Pwm",
			variantName: "default",
			className: "Pwm_default_hz_audio_width_audio_offset_audio_trig_scalar",
			paramNames: [
				"hz",
				"width",
				"offset",
				"trig"
			],
			paramModes: [
				"audio",
				"audio",
				"audio",
				"scalar"
			],
			emitNames: [],
			usesInput: false
		},
		{
			id: 182,
			genName: "Pwm",
			variantName: "default",
			className: "Pwm_default_hz_audio_width_audio_offset_audio_trig_audio",
			paramNames: [
				"hz",
				"width",
				"offset",
				"trig"
			],
			paramModes: [
				"audio",
				"audio",
				"audio",
				"audio"
			],
			emitNames: [],
			usesInput: false
		},
		{
			id: 183,
			genName: "Ad",
			variantName: "default",
			className: "Ad_default_attack_scalar_decay_scalar_exponent_scalar_trig_scalar",
			paramNames: [
				"attack",
				"decay",
				"exponent",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: ["stage", "env"],
			usesInput: false
		},
		{
			id: 184,
			genName: "Ad",
			variantName: "default",
			className: "Ad_default_attack_scalar_decay_scalar_exponent_scalar_trig_audio",
			paramNames: [
				"attack",
				"decay",
				"exponent",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"scalar",
				"audio"
			],
			emitNames: ["stage", "env"],
			usesInput: false
		},
		{
			id: 185,
			genName: "Ad",
			variantName: "default",
			className: "Ad_default_attack_scalar_decay_scalar_exponent_audio_trig_scalar",
			paramNames: [
				"attack",
				"decay",
				"exponent",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"audio",
				"scalar"
			],
			emitNames: ["stage", "env"],
			usesInput: false
		},
		{
			id: 186,
			genName: "Ad",
			variantName: "default",
			className: "Ad_default_attack_scalar_decay_scalar_exponent_audio_trig_audio",
			paramNames: [
				"attack",
				"decay",
				"exponent",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"audio",
				"audio"
			],
			emitNames: ["stage", "env"],
			usesInput: false
		},
		{
			id: 187,
			genName: "Ad",
			variantName: "default",
			className: "Ad_default_attack_scalar_decay_audio_exponent_scalar_trig_scalar",
			paramNames: [
				"attack",
				"decay",
				"exponent",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"scalar",
				"scalar"
			],
			emitNames: ["stage", "env"],
			usesInput: false
		},
		{
			id: 188,
			genName: "Ad",
			variantName: "default",
			className: "Ad_default_attack_scalar_decay_audio_exponent_scalar_trig_audio",
			paramNames: [
				"attack",
				"decay",
				"exponent",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"scalar",
				"audio"
			],
			emitNames: ["stage", "env"],
			usesInput: false
		},
		{
			id: 189,
			genName: "Ad",
			variantName: "default",
			className: "Ad_default_attack_scalar_decay_audio_exponent_audio_trig_scalar",
			paramNames: [
				"attack",
				"decay",
				"exponent",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"audio",
				"scalar"
			],
			emitNames: ["stage", "env"],
			usesInput: false
		},
		{
			id: 190,
			genName: "Ad",
			variantName: "default",
			className: "Ad_default_attack_scalar_decay_audio_exponent_audio_trig_audio",
			paramNames: [
				"attack",
				"decay",
				"exponent",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"audio",
				"audio"
			],
			emitNames: ["stage", "env"],
			usesInput: false
		},
		{
			id: 191,
			genName: "Ad",
			variantName: "default",
			className: "Ad_default_attack_audio_decay_scalar_exponent_scalar_trig_scalar",
			paramNames: [
				"attack",
				"decay",
				"exponent",
				"trig"
			],
			paramModes: [
				"audio",
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: ["stage", "env"],
			usesInput: false
		},
		{
			id: 192,
			genName: "Ad",
			variantName: "default",
			className: "Ad_default_attack_audio_decay_scalar_exponent_scalar_trig_audio",
			paramNames: [
				"attack",
				"decay",
				"exponent",
				"trig"
			],
			paramModes: [
				"audio",
				"scalar",
				"scalar",
				"audio"
			],
			emitNames: ["stage", "env"],
			usesInput: false
		},
		{
			id: 193,
			genName: "Ad",
			variantName: "default",
			className: "Ad_default_attack_audio_decay_scalar_exponent_audio_trig_scalar",
			paramNames: [
				"attack",
				"decay",
				"exponent",
				"trig"
			],
			paramModes: [
				"audio",
				"scalar",
				"audio",
				"scalar"
			],
			emitNames: ["stage", "env"],
			usesInput: false
		},
		{
			id: 194,
			genName: "Ad",
			variantName: "default",
			className: "Ad_default_attack_audio_decay_scalar_exponent_audio_trig_audio",
			paramNames: [
				"attack",
				"decay",
				"exponent",
				"trig"
			],
			paramModes: [
				"audio",
				"scalar",
				"audio",
				"audio"
			],
			emitNames: ["stage", "env"],
			usesInput: false
		},
		{
			id: 195,
			genName: "Ad",
			variantName: "default",
			className: "Ad_default_attack_audio_decay_audio_exponent_scalar_trig_scalar",
			paramNames: [
				"attack",
				"decay",
				"exponent",
				"trig"
			],
			paramModes: [
				"audio",
				"audio",
				"scalar",
				"scalar"
			],
			emitNames: ["stage", "env"],
			usesInput: false
		},
		{
			id: 196,
			genName: "Ad",
			variantName: "default",
			className: "Ad_default_attack_audio_decay_audio_exponent_scalar_trig_audio",
			paramNames: [
				"attack",
				"decay",
				"exponent",
				"trig"
			],
			paramModes: [
				"audio",
				"audio",
				"scalar",
				"audio"
			],
			emitNames: ["stage", "env"],
			usesInput: false
		},
		{
			id: 197,
			genName: "Ad",
			variantName: "default",
			className: "Ad_default_attack_audio_decay_audio_exponent_audio_trig_scalar",
			paramNames: [
				"attack",
				"decay",
				"exponent",
				"trig"
			],
			paramModes: [
				"audio",
				"audio",
				"audio",
				"scalar"
			],
			emitNames: ["stage", "env"],
			usesInput: false
		},
		{
			id: 198,
			genName: "Ad",
			variantName: "default",
			className: "Ad_default_attack_audio_decay_audio_exponent_audio_trig_audio",
			paramNames: [
				"attack",
				"decay",
				"exponent",
				"trig"
			],
			paramModes: [
				"audio",
				"audio",
				"audio",
				"audio"
			],
			emitNames: ["stage", "env"],
			usesInput: false
		},
		{
			id: 199,
			genName: "Onepole",
			variantName: "lp1",
			className: "Onepole_lp1_cutoff_scalar",
			paramNames: ["cutoff"],
			paramModes: ["scalar"],
			emitNames: [],
			usesInput: true
		},
		{
			id: 200,
			genName: "Onepole",
			variantName: "lp1",
			className: "Onepole_lp1_cutoff_audio",
			paramNames: ["cutoff"],
			paramModes: ["audio"],
			emitNames: [],
			usesInput: true
		},
		{
			id: 201,
			genName: "Onepole",
			variantName: "hp1",
			className: "Onepole_hp1_cutoff_scalar",
			paramNames: ["cutoff"],
			paramModes: ["scalar"],
			emitNames: [],
			usesInput: true
		},
		{
			id: 202,
			genName: "Onepole",
			variantName: "hp1",
			className: "Onepole_hp1_cutoff_audio",
			paramNames: ["cutoff"],
			paramModes: ["audio"],
			emitNames: [],
			usesInput: true
		},
		{
			id: 203,
			genName: "Sqr",
			variantName: "default",
			className: "Sqr_default_hz_scalar_offset_scalar_trig_scalar",
			paramNames: [
				"hz",
				"offset",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: [],
			usesInput: false
		},
		{
			id: 204,
			genName: "Sqr",
			variantName: "default",
			className: "Sqr_default_hz_scalar_offset_scalar_trig_audio",
			paramNames: [
				"hz",
				"offset",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"audio"
			],
			emitNames: [],
			usesInput: false
		},
		{
			id: 205,
			genName: "Sqr",
			variantName: "default",
			className: "Sqr_default_hz_scalar_offset_audio_trig_scalar",
			paramNames: [
				"hz",
				"offset",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"scalar"
			],
			emitNames: [],
			usesInput: false
		},
		{
			id: 206,
			genName: "Sqr",
			variantName: "default",
			className: "Sqr_default_hz_scalar_offset_audio_trig_audio",
			paramNames: [
				"hz",
				"offset",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"audio"
			],
			emitNames: [],
			usesInput: false
		},
		{
			id: 207,
			genName: "Sqr",
			variantName: "default",
			className: "Sqr_default_hz_audio_offset_scalar_trig_scalar",
			paramNames: [
				"hz",
				"offset",
				"trig"
			],
			paramModes: [
				"audio",
				"scalar",
				"scalar"
			],
			emitNames: [],
			usesInput: false
		},
		{
			id: 208,
			genName: "Sqr",
			variantName: "default",
			className: "Sqr_default_hz_audio_offset_scalar_trig_audio",
			paramNames: [
				"hz",
				"offset",
				"trig"
			],
			paramModes: [
				"audio",
				"scalar",
				"audio"
			],
			emitNames: [],
			usesInput: false
		},
		{
			id: 209,
			genName: "Sqr",
			variantName: "default",
			className: "Sqr_default_hz_audio_offset_audio_trig_scalar",
			paramNames: [
				"hz",
				"offset",
				"trig"
			],
			paramModes: [
				"audio",
				"audio",
				"scalar"
			],
			emitNames: [],
			usesInput: false
		},
		{
			id: 210,
			genName: "Sqr",
			variantName: "default",
			className: "Sqr_default_hz_audio_offset_audio_trig_audio",
			paramNames: [
				"hz",
				"offset",
				"trig"
			],
			paramModes: [
				"audio",
				"audio",
				"audio"
			],
			emitNames: [],
			usesInput: false
		},
		{
			id: 211,
			genName: "Hold",
			variantName: "default",
			className: "Hold_default_",
			paramNames: [],
			paramModes: [],
			emitNames: [],
			usesInput: true
		},
		{
			id: 212,
			genName: "Lfosaw",
			variantName: "default",
			className: "Lfosaw_default_bar_scalar_offset_scalar_trig_scalar",
			paramNames: [
				"bar",
				"offset",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 213,
			genName: "Lfosaw",
			variantName: "default",
			className: "Lfosaw_default_bar_scalar_offset_scalar_trig_audio",
			paramNames: [
				"bar",
				"offset",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"audio"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 214,
			genName: "Lfosaw",
			variantName: "default",
			className: "Lfosaw_default_bar_scalar_offset_audio_trig_scalar",
			paramNames: [
				"bar",
				"offset",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"scalar"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 215,
			genName: "Lfosaw",
			variantName: "default",
			className: "Lfosaw_default_bar_scalar_offset_audio_trig_audio",
			paramNames: [
				"bar",
				"offset",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"audio"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 216,
			genName: "Lfosaw",
			variantName: "default",
			className: "Lfosaw_default_bar_audio_offset_scalar_trig_scalar",
			paramNames: [
				"bar",
				"offset",
				"trig"
			],
			paramModes: [
				"audio",
				"scalar",
				"scalar"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 217,
			genName: "Lfosaw",
			variantName: "default",
			className: "Lfosaw_default_bar_audio_offset_scalar_trig_audio",
			paramNames: [
				"bar",
				"offset",
				"trig"
			],
			paramModes: [
				"audio",
				"scalar",
				"audio"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 218,
			genName: "Lfosaw",
			variantName: "default",
			className: "Lfosaw_default_bar_audio_offset_audio_trig_scalar",
			paramNames: [
				"bar",
				"offset",
				"trig"
			],
			paramModes: [
				"audio",
				"audio",
				"scalar"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 219,
			genName: "Lfosaw",
			variantName: "default",
			className: "Lfosaw_default_bar_audio_offset_audio_trig_audio",
			paramNames: [
				"bar",
				"offset",
				"trig"
			],
			paramModes: [
				"audio",
				"audio",
				"audio"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 220,
			genName: "Compressor",
			variantName: "default",
			className: "Compressor_default_attack_scalar_release_scalar_threshold_scalar_ratio_scalar_knee_scalar_key_scalar",
			paramNames: [
				"attack",
				"release",
				"threshold",
				"ratio",
				"knee",
				"key"
			],
			paramModes: [
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: ["inputLevel", "gainReduction"],
			usesInput: true
		},
		{
			id: 221,
			genName: "Compressor",
			variantName: "default",
			className: "Compressor_default_attack_scalar_release_scalar_threshold_scalar_ratio_scalar_knee_scalar_key_audio",
			paramNames: [
				"attack",
				"release",
				"threshold",
				"ratio",
				"knee",
				"key"
			],
			paramModes: [
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"audio"
			],
			emitNames: ["inputLevel", "gainReduction"],
			usesInput: true
		},
		{
			id: 222,
			genName: "Compressor",
			variantName: "default",
			className: "Compressor_default_attack_scalar_release_scalar_threshold_scalar_ratio_scalar_knee_audio_key_scalar",
			paramNames: [
				"attack",
				"release",
				"threshold",
				"ratio",
				"knee",
				"key"
			],
			paramModes: [
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"audio",
				"scalar"
			],
			emitNames: ["inputLevel", "gainReduction"],
			usesInput: true
		},
		{
			id: 223,
			genName: "Compressor",
			variantName: "default",
			className: "Compressor_default_attack_scalar_release_scalar_threshold_scalar_ratio_scalar_knee_audio_key_audio",
			paramNames: [
				"attack",
				"release",
				"threshold",
				"ratio",
				"knee",
				"key"
			],
			paramModes: [
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"audio",
				"audio"
			],
			emitNames: ["inputLevel", "gainReduction"],
			usesInput: true
		},
		{
			id: 224,
			genName: "Compressor",
			variantName: "default",
			className: "Compressor_default_attack_scalar_release_scalar_threshold_scalar_ratio_audio_knee_scalar_key_scalar",
			paramNames: [
				"attack",
				"release",
				"threshold",
				"ratio",
				"knee",
				"key"
			],
			paramModes: [
				"scalar",
				"scalar",
				"scalar",
				"audio",
				"scalar",
				"scalar"
			],
			emitNames: ["inputLevel", "gainReduction"],
			usesInput: true
		},
		{
			id: 225,
			genName: "Compressor",
			variantName: "default",
			className: "Compressor_default_attack_scalar_release_scalar_threshold_scalar_ratio_audio_knee_scalar_key_audio",
			paramNames: [
				"attack",
				"release",
				"threshold",
				"ratio",
				"knee",
				"key"
			],
			paramModes: [
				"scalar",
				"scalar",
				"scalar",
				"audio",
				"scalar",
				"audio"
			],
			emitNames: ["inputLevel", "gainReduction"],
			usesInput: true
		},
		{
			id: 226,
			genName: "Compressor",
			variantName: "default",
			className: "Compressor_default_attack_scalar_release_scalar_threshold_scalar_ratio_audio_knee_audio_key_scalar",
			paramNames: [
				"attack",
				"release",
				"threshold",
				"ratio",
				"knee",
				"key"
			],
			paramModes: [
				"scalar",
				"scalar",
				"scalar",
				"audio",
				"audio",
				"scalar"
			],
			emitNames: ["inputLevel", "gainReduction"],
			usesInput: true
		},
		{
			id: 227,
			genName: "Compressor",
			variantName: "default",
			className: "Compressor_default_attack_scalar_release_scalar_threshold_scalar_ratio_audio_knee_audio_key_audio",
			paramNames: [
				"attack",
				"release",
				"threshold",
				"ratio",
				"knee",
				"key"
			],
			paramModes: [
				"scalar",
				"scalar",
				"scalar",
				"audio",
				"audio",
				"audio"
			],
			emitNames: ["inputLevel", "gainReduction"],
			usesInput: true
		},
		{
			id: 228,
			genName: "Compressor",
			variantName: "default",
			className: "Compressor_default_attack_scalar_release_scalar_threshold_audio_ratio_scalar_knee_scalar_key_scalar",
			paramNames: [
				"attack",
				"release",
				"threshold",
				"ratio",
				"knee",
				"key"
			],
			paramModes: [
				"scalar",
				"scalar",
				"audio",
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: ["inputLevel", "gainReduction"],
			usesInput: true
		},
		{
			id: 229,
			genName: "Compressor",
			variantName: "default",
			className: "Compressor_default_attack_scalar_release_scalar_threshold_audio_ratio_scalar_knee_scalar_key_audio",
			paramNames: [
				"attack",
				"release",
				"threshold",
				"ratio",
				"knee",
				"key"
			],
			paramModes: [
				"scalar",
				"scalar",
				"audio",
				"scalar",
				"scalar",
				"audio"
			],
			emitNames: ["inputLevel", "gainReduction"],
			usesInput: true
		},
		{
			id: 230,
			genName: "Compressor",
			variantName: "default",
			className: "Compressor_default_attack_scalar_release_scalar_threshold_audio_ratio_scalar_knee_audio_key_scalar",
			paramNames: [
				"attack",
				"release",
				"threshold",
				"ratio",
				"knee",
				"key"
			],
			paramModes: [
				"scalar",
				"scalar",
				"audio",
				"scalar",
				"audio",
				"scalar"
			],
			emitNames: ["inputLevel", "gainReduction"],
			usesInput: true
		},
		{
			id: 231,
			genName: "Compressor",
			variantName: "default",
			className: "Compressor_default_attack_scalar_release_scalar_threshold_audio_ratio_scalar_knee_audio_key_audio",
			paramNames: [
				"attack",
				"release",
				"threshold",
				"ratio",
				"knee",
				"key"
			],
			paramModes: [
				"scalar",
				"scalar",
				"audio",
				"scalar",
				"audio",
				"audio"
			],
			emitNames: ["inputLevel", "gainReduction"],
			usesInput: true
		},
		{
			id: 232,
			genName: "Compressor",
			variantName: "default",
			className: "Compressor_default_attack_scalar_release_scalar_threshold_audio_ratio_audio_knee_scalar_key_scalar",
			paramNames: [
				"attack",
				"release",
				"threshold",
				"ratio",
				"knee",
				"key"
			],
			paramModes: [
				"scalar",
				"scalar",
				"audio",
				"audio",
				"scalar",
				"scalar"
			],
			emitNames: ["inputLevel", "gainReduction"],
			usesInput: true
		},
		{
			id: 233,
			genName: "Compressor",
			variantName: "default",
			className: "Compressor_default_attack_scalar_release_scalar_threshold_audio_ratio_audio_knee_scalar_key_audio",
			paramNames: [
				"attack",
				"release",
				"threshold",
				"ratio",
				"knee",
				"key"
			],
			paramModes: [
				"scalar",
				"scalar",
				"audio",
				"audio",
				"scalar",
				"audio"
			],
			emitNames: ["inputLevel", "gainReduction"],
			usesInput: true
		},
		{
			id: 234,
			genName: "Compressor",
			variantName: "default",
			className: "Compressor_default_attack_scalar_release_scalar_threshold_audio_ratio_audio_knee_audio_key_scalar",
			paramNames: [
				"attack",
				"release",
				"threshold",
				"ratio",
				"knee",
				"key"
			],
			paramModes: [
				"scalar",
				"scalar",
				"audio",
				"audio",
				"audio",
				"scalar"
			],
			emitNames: ["inputLevel", "gainReduction"],
			usesInput: true
		},
		{
			id: 235,
			genName: "Compressor",
			variantName: "default",
			className: "Compressor_default_attack_scalar_release_scalar_threshold_audio_ratio_audio_knee_audio_key_audio",
			paramNames: [
				"attack",
				"release",
				"threshold",
				"ratio",
				"knee",
				"key"
			],
			paramModes: [
				"scalar",
				"scalar",
				"audio",
				"audio",
				"audio",
				"audio"
			],
			emitNames: ["inputLevel", "gainReduction"],
			usesInput: true
		},
		{
			id: 236,
			genName: "Compressor",
			variantName: "default",
			className: "Compressor_default_attack_scalar_release_audio_threshold_scalar_ratio_scalar_knee_scalar_key_scalar",
			paramNames: [
				"attack",
				"release",
				"threshold",
				"ratio",
				"knee",
				"key"
			],
			paramModes: [
				"scalar",
				"audio",
				"scalar",
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: ["inputLevel", "gainReduction"],
			usesInput: true
		},
		{
			id: 237,
			genName: "Compressor",
			variantName: "default",
			className: "Compressor_default_attack_scalar_release_audio_threshold_scalar_ratio_scalar_knee_scalar_key_audio",
			paramNames: [
				"attack",
				"release",
				"threshold",
				"ratio",
				"knee",
				"key"
			],
			paramModes: [
				"scalar",
				"audio",
				"scalar",
				"scalar",
				"scalar",
				"audio"
			],
			emitNames: ["inputLevel", "gainReduction"],
			usesInput: true
		},
		{
			id: 238,
			genName: "Compressor",
			variantName: "default",
			className: "Compressor_default_attack_scalar_release_audio_threshold_scalar_ratio_scalar_knee_audio_key_scalar",
			paramNames: [
				"attack",
				"release",
				"threshold",
				"ratio",
				"knee",
				"key"
			],
			paramModes: [
				"scalar",
				"audio",
				"scalar",
				"scalar",
				"audio",
				"scalar"
			],
			emitNames: ["inputLevel", "gainReduction"],
			usesInput: true
		},
		{
			id: 239,
			genName: "Compressor",
			variantName: "default",
			className: "Compressor_default_attack_scalar_release_audio_threshold_scalar_ratio_scalar_knee_audio_key_audio",
			paramNames: [
				"attack",
				"release",
				"threshold",
				"ratio",
				"knee",
				"key"
			],
			paramModes: [
				"scalar",
				"audio",
				"scalar",
				"scalar",
				"audio",
				"audio"
			],
			emitNames: ["inputLevel", "gainReduction"],
			usesInput: true
		},
		{
			id: 240,
			genName: "Compressor",
			variantName: "default",
			className: "Compressor_default_attack_scalar_release_audio_threshold_scalar_ratio_audio_knee_scalar_key_scalar",
			paramNames: [
				"attack",
				"release",
				"threshold",
				"ratio",
				"knee",
				"key"
			],
			paramModes: [
				"scalar",
				"audio",
				"scalar",
				"audio",
				"scalar",
				"scalar"
			],
			emitNames: ["inputLevel", "gainReduction"],
			usesInput: true
		},
		{
			id: 241,
			genName: "Compressor",
			variantName: "default",
			className: "Compressor_default_attack_scalar_release_audio_threshold_scalar_ratio_audio_knee_scalar_key_audio",
			paramNames: [
				"attack",
				"release",
				"threshold",
				"ratio",
				"knee",
				"key"
			],
			paramModes: [
				"scalar",
				"audio",
				"scalar",
				"audio",
				"scalar",
				"audio"
			],
			emitNames: ["inputLevel", "gainReduction"],
			usesInput: true
		},
		{
			id: 242,
			genName: "Compressor",
			variantName: "default",
			className: "Compressor_default_attack_scalar_release_audio_threshold_scalar_ratio_audio_knee_audio_key_scalar",
			paramNames: [
				"attack",
				"release",
				"threshold",
				"ratio",
				"knee",
				"key"
			],
			paramModes: [
				"scalar",
				"audio",
				"scalar",
				"audio",
				"audio",
				"scalar"
			],
			emitNames: ["inputLevel", "gainReduction"],
			usesInput: true
		},
		{
			id: 243,
			genName: "Compressor",
			variantName: "default",
			className: "Compressor_default_attack_scalar_release_audio_threshold_scalar_ratio_audio_knee_audio_key_audio",
			paramNames: [
				"attack",
				"release",
				"threshold",
				"ratio",
				"knee",
				"key"
			],
			paramModes: [
				"scalar",
				"audio",
				"scalar",
				"audio",
				"audio",
				"audio"
			],
			emitNames: ["inputLevel", "gainReduction"],
			usesInput: true
		},
		{
			id: 244,
			genName: "Compressor",
			variantName: "default",
			className: "Compressor_default_attack_scalar_release_audio_threshold_audio_ratio_scalar_knee_scalar_key_scalar",
			paramNames: [
				"attack",
				"release",
				"threshold",
				"ratio",
				"knee",
				"key"
			],
			paramModes: [
				"scalar",
				"audio",
				"audio",
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: ["inputLevel", "gainReduction"],
			usesInput: true
		},
		{
			id: 245,
			genName: "Compressor",
			variantName: "default",
			className: "Compressor_default_attack_scalar_release_audio_threshold_audio_ratio_scalar_knee_scalar_key_audio",
			paramNames: [
				"attack",
				"release",
				"threshold",
				"ratio",
				"knee",
				"key"
			],
			paramModes: [
				"scalar",
				"audio",
				"audio",
				"scalar",
				"scalar",
				"audio"
			],
			emitNames: ["inputLevel", "gainReduction"],
			usesInput: true
		},
		{
			id: 246,
			genName: "Compressor",
			variantName: "default",
			className: "Compressor_default_attack_scalar_release_audio_threshold_audio_ratio_scalar_knee_audio_key_scalar",
			paramNames: [
				"attack",
				"release",
				"threshold",
				"ratio",
				"knee",
				"key"
			],
			paramModes: [
				"scalar",
				"audio",
				"audio",
				"scalar",
				"audio",
				"scalar"
			],
			emitNames: ["inputLevel", "gainReduction"],
			usesInput: true
		},
		{
			id: 247,
			genName: "Compressor",
			variantName: "default",
			className: "Compressor_default_attack_scalar_release_audio_threshold_audio_ratio_scalar_knee_audio_key_audio",
			paramNames: [
				"attack",
				"release",
				"threshold",
				"ratio",
				"knee",
				"key"
			],
			paramModes: [
				"scalar",
				"audio",
				"audio",
				"scalar",
				"audio",
				"audio"
			],
			emitNames: ["inputLevel", "gainReduction"],
			usesInput: true
		},
		{
			id: 248,
			genName: "Compressor",
			variantName: "default",
			className: "Compressor_default_attack_scalar_release_audio_threshold_audio_ratio_audio_knee_scalar_key_scalar",
			paramNames: [
				"attack",
				"release",
				"threshold",
				"ratio",
				"knee",
				"key"
			],
			paramModes: [
				"scalar",
				"audio",
				"audio",
				"audio",
				"scalar",
				"scalar"
			],
			emitNames: ["inputLevel", "gainReduction"],
			usesInput: true
		},
		{
			id: 249,
			genName: "Compressor",
			variantName: "default",
			className: "Compressor_default_attack_scalar_release_audio_threshold_audio_ratio_audio_knee_scalar_key_audio",
			paramNames: [
				"attack",
				"release",
				"threshold",
				"ratio",
				"knee",
				"key"
			],
			paramModes: [
				"scalar",
				"audio",
				"audio",
				"audio",
				"scalar",
				"audio"
			],
			emitNames: ["inputLevel", "gainReduction"],
			usesInput: true
		},
		{
			id: 250,
			genName: "Compressor",
			variantName: "default",
			className: "Compressor_default_attack_scalar_release_audio_threshold_audio_ratio_audio_knee_audio_key_scalar",
			paramNames: [
				"attack",
				"release",
				"threshold",
				"ratio",
				"knee",
				"key"
			],
			paramModes: [
				"scalar",
				"audio",
				"audio",
				"audio",
				"audio",
				"scalar"
			],
			emitNames: ["inputLevel", "gainReduction"],
			usesInput: true
		},
		{
			id: 251,
			genName: "Compressor",
			variantName: "default",
			className: "Compressor_default_attack_scalar_release_audio_threshold_audio_ratio_audio_knee_audio_key_audio",
			paramNames: [
				"attack",
				"release",
				"threshold",
				"ratio",
				"knee",
				"key"
			],
			paramModes: [
				"scalar",
				"audio",
				"audio",
				"audio",
				"audio",
				"audio"
			],
			emitNames: ["inputLevel", "gainReduction"],
			usesInput: true
		},
		{
			id: 252,
			genName: "Compressor",
			variantName: "default",
			className: "Compressor_default_attack_audio_release_scalar_threshold_scalar_ratio_scalar_knee_scalar_key_scalar",
			paramNames: [
				"attack",
				"release",
				"threshold",
				"ratio",
				"knee",
				"key"
			],
			paramModes: [
				"audio",
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: ["inputLevel", "gainReduction"],
			usesInput: true
		},
		{
			id: 253,
			genName: "Compressor",
			variantName: "default",
			className: "Compressor_default_attack_audio_release_scalar_threshold_scalar_ratio_scalar_knee_scalar_key_audio",
			paramNames: [
				"attack",
				"release",
				"threshold",
				"ratio",
				"knee",
				"key"
			],
			paramModes: [
				"audio",
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"audio"
			],
			emitNames: ["inputLevel", "gainReduction"],
			usesInput: true
		},
		{
			id: 254,
			genName: "Compressor",
			variantName: "default",
			className: "Compressor_default_attack_audio_release_scalar_threshold_scalar_ratio_scalar_knee_audio_key_scalar",
			paramNames: [
				"attack",
				"release",
				"threshold",
				"ratio",
				"knee",
				"key"
			],
			paramModes: [
				"audio",
				"scalar",
				"scalar",
				"scalar",
				"audio",
				"scalar"
			],
			emitNames: ["inputLevel", "gainReduction"],
			usesInput: true
		},
		{
			id: 255,
			genName: "Compressor",
			variantName: "default",
			className: "Compressor_default_attack_audio_release_scalar_threshold_scalar_ratio_scalar_knee_audio_key_audio",
			paramNames: [
				"attack",
				"release",
				"threshold",
				"ratio",
				"knee",
				"key"
			],
			paramModes: [
				"audio",
				"scalar",
				"scalar",
				"scalar",
				"audio",
				"audio"
			],
			emitNames: ["inputLevel", "gainReduction"],
			usesInput: true
		},
		{
			id: 256,
			genName: "Compressor",
			variantName: "default",
			className: "Compressor_default_attack_audio_release_scalar_threshold_scalar_ratio_audio_knee_scalar_key_scalar",
			paramNames: [
				"attack",
				"release",
				"threshold",
				"ratio",
				"knee",
				"key"
			],
			paramModes: [
				"audio",
				"scalar",
				"scalar",
				"audio",
				"scalar",
				"scalar"
			],
			emitNames: ["inputLevel", "gainReduction"],
			usesInput: true
		},
		{
			id: 257,
			genName: "Compressor",
			variantName: "default",
			className: "Compressor_default_attack_audio_release_scalar_threshold_scalar_ratio_audio_knee_scalar_key_audio",
			paramNames: [
				"attack",
				"release",
				"threshold",
				"ratio",
				"knee",
				"key"
			],
			paramModes: [
				"audio",
				"scalar",
				"scalar",
				"audio",
				"scalar",
				"audio"
			],
			emitNames: ["inputLevel", "gainReduction"],
			usesInput: true
		},
		{
			id: 258,
			genName: "Compressor",
			variantName: "default",
			className: "Compressor_default_attack_audio_release_scalar_threshold_scalar_ratio_audio_knee_audio_key_scalar",
			paramNames: [
				"attack",
				"release",
				"threshold",
				"ratio",
				"knee",
				"key"
			],
			paramModes: [
				"audio",
				"scalar",
				"scalar",
				"audio",
				"audio",
				"scalar"
			],
			emitNames: ["inputLevel", "gainReduction"],
			usesInput: true
		},
		{
			id: 259,
			genName: "Compressor",
			variantName: "default",
			className: "Compressor_default_attack_audio_release_scalar_threshold_scalar_ratio_audio_knee_audio_key_audio",
			paramNames: [
				"attack",
				"release",
				"threshold",
				"ratio",
				"knee",
				"key"
			],
			paramModes: [
				"audio",
				"scalar",
				"scalar",
				"audio",
				"audio",
				"audio"
			],
			emitNames: ["inputLevel", "gainReduction"],
			usesInput: true
		},
		{
			id: 260,
			genName: "Compressor",
			variantName: "default",
			className: "Compressor_default_attack_audio_release_scalar_threshold_audio_ratio_scalar_knee_scalar_key_scalar",
			paramNames: [
				"attack",
				"release",
				"threshold",
				"ratio",
				"knee",
				"key"
			],
			paramModes: [
				"audio",
				"scalar",
				"audio",
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: ["inputLevel", "gainReduction"],
			usesInput: true
		},
		{
			id: 261,
			genName: "Compressor",
			variantName: "default",
			className: "Compressor_default_attack_audio_release_scalar_threshold_audio_ratio_scalar_knee_scalar_key_audio",
			paramNames: [
				"attack",
				"release",
				"threshold",
				"ratio",
				"knee",
				"key"
			],
			paramModes: [
				"audio",
				"scalar",
				"audio",
				"scalar",
				"scalar",
				"audio"
			],
			emitNames: ["inputLevel", "gainReduction"],
			usesInput: true
		},
		{
			id: 262,
			genName: "Compressor",
			variantName: "default",
			className: "Compressor_default_attack_audio_release_scalar_threshold_audio_ratio_scalar_knee_audio_key_scalar",
			paramNames: [
				"attack",
				"release",
				"threshold",
				"ratio",
				"knee",
				"key"
			],
			paramModes: [
				"audio",
				"scalar",
				"audio",
				"scalar",
				"audio",
				"scalar"
			],
			emitNames: ["inputLevel", "gainReduction"],
			usesInput: true
		},
		{
			id: 263,
			genName: "Compressor",
			variantName: "default",
			className: "Compressor_default_attack_audio_release_scalar_threshold_audio_ratio_scalar_knee_audio_key_audio",
			paramNames: [
				"attack",
				"release",
				"threshold",
				"ratio",
				"knee",
				"key"
			],
			paramModes: [
				"audio",
				"scalar",
				"audio",
				"scalar",
				"audio",
				"audio"
			],
			emitNames: ["inputLevel", "gainReduction"],
			usesInput: true
		},
		{
			id: 264,
			genName: "Compressor",
			variantName: "default",
			className: "Compressor_default_attack_audio_release_scalar_threshold_audio_ratio_audio_knee_scalar_key_scalar",
			paramNames: [
				"attack",
				"release",
				"threshold",
				"ratio",
				"knee",
				"key"
			],
			paramModes: [
				"audio",
				"scalar",
				"audio",
				"audio",
				"scalar",
				"scalar"
			],
			emitNames: ["inputLevel", "gainReduction"],
			usesInput: true
		},
		{
			id: 265,
			genName: "Compressor",
			variantName: "default",
			className: "Compressor_default_attack_audio_release_scalar_threshold_audio_ratio_audio_knee_scalar_key_audio",
			paramNames: [
				"attack",
				"release",
				"threshold",
				"ratio",
				"knee",
				"key"
			],
			paramModes: [
				"audio",
				"scalar",
				"audio",
				"audio",
				"scalar",
				"audio"
			],
			emitNames: ["inputLevel", "gainReduction"],
			usesInput: true
		},
		{
			id: 266,
			genName: "Compressor",
			variantName: "default",
			className: "Compressor_default_attack_audio_release_scalar_threshold_audio_ratio_audio_knee_audio_key_scalar",
			paramNames: [
				"attack",
				"release",
				"threshold",
				"ratio",
				"knee",
				"key"
			],
			paramModes: [
				"audio",
				"scalar",
				"audio",
				"audio",
				"audio",
				"scalar"
			],
			emitNames: ["inputLevel", "gainReduction"],
			usesInput: true
		},
		{
			id: 267,
			genName: "Compressor",
			variantName: "default",
			className: "Compressor_default_attack_audio_release_scalar_threshold_audio_ratio_audio_knee_audio_key_audio",
			paramNames: [
				"attack",
				"release",
				"threshold",
				"ratio",
				"knee",
				"key"
			],
			paramModes: [
				"audio",
				"scalar",
				"audio",
				"audio",
				"audio",
				"audio"
			],
			emitNames: ["inputLevel", "gainReduction"],
			usesInput: true
		},
		{
			id: 268,
			genName: "Compressor",
			variantName: "default",
			className: "Compressor_default_attack_audio_release_audio_threshold_scalar_ratio_scalar_knee_scalar_key_scalar",
			paramNames: [
				"attack",
				"release",
				"threshold",
				"ratio",
				"knee",
				"key"
			],
			paramModes: [
				"audio",
				"audio",
				"scalar",
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: ["inputLevel", "gainReduction"],
			usesInput: true
		},
		{
			id: 269,
			genName: "Compressor",
			variantName: "default",
			className: "Compressor_default_attack_audio_release_audio_threshold_scalar_ratio_scalar_knee_scalar_key_audio",
			paramNames: [
				"attack",
				"release",
				"threshold",
				"ratio",
				"knee",
				"key"
			],
			paramModes: [
				"audio",
				"audio",
				"scalar",
				"scalar",
				"scalar",
				"audio"
			],
			emitNames: ["inputLevel", "gainReduction"],
			usesInput: true
		},
		{
			id: 270,
			genName: "Compressor",
			variantName: "default",
			className: "Compressor_default_attack_audio_release_audio_threshold_scalar_ratio_scalar_knee_audio_key_scalar",
			paramNames: [
				"attack",
				"release",
				"threshold",
				"ratio",
				"knee",
				"key"
			],
			paramModes: [
				"audio",
				"audio",
				"scalar",
				"scalar",
				"audio",
				"scalar"
			],
			emitNames: ["inputLevel", "gainReduction"],
			usesInput: true
		},
		{
			id: 271,
			genName: "Compressor",
			variantName: "default",
			className: "Compressor_default_attack_audio_release_audio_threshold_scalar_ratio_scalar_knee_audio_key_audio",
			paramNames: [
				"attack",
				"release",
				"threshold",
				"ratio",
				"knee",
				"key"
			],
			paramModes: [
				"audio",
				"audio",
				"scalar",
				"scalar",
				"audio",
				"audio"
			],
			emitNames: ["inputLevel", "gainReduction"],
			usesInput: true
		},
		{
			id: 272,
			genName: "Compressor",
			variantName: "default",
			className: "Compressor_default_attack_audio_release_audio_threshold_scalar_ratio_audio_knee_scalar_key_scalar",
			paramNames: [
				"attack",
				"release",
				"threshold",
				"ratio",
				"knee",
				"key"
			],
			paramModes: [
				"audio",
				"audio",
				"scalar",
				"audio",
				"scalar",
				"scalar"
			],
			emitNames: ["inputLevel", "gainReduction"],
			usesInput: true
		},
		{
			id: 273,
			genName: "Compressor",
			variantName: "default",
			className: "Compressor_default_attack_audio_release_audio_threshold_scalar_ratio_audio_knee_scalar_key_audio",
			paramNames: [
				"attack",
				"release",
				"threshold",
				"ratio",
				"knee",
				"key"
			],
			paramModes: [
				"audio",
				"audio",
				"scalar",
				"audio",
				"scalar",
				"audio"
			],
			emitNames: ["inputLevel", "gainReduction"],
			usesInput: true
		},
		{
			id: 274,
			genName: "Compressor",
			variantName: "default",
			className: "Compressor_default_attack_audio_release_audio_threshold_scalar_ratio_audio_knee_audio_key_scalar",
			paramNames: [
				"attack",
				"release",
				"threshold",
				"ratio",
				"knee",
				"key"
			],
			paramModes: [
				"audio",
				"audio",
				"scalar",
				"audio",
				"audio",
				"scalar"
			],
			emitNames: ["inputLevel", "gainReduction"],
			usesInput: true
		},
		{
			id: 275,
			genName: "Compressor",
			variantName: "default",
			className: "Compressor_default_attack_audio_release_audio_threshold_scalar_ratio_audio_knee_audio_key_audio",
			paramNames: [
				"attack",
				"release",
				"threshold",
				"ratio",
				"knee",
				"key"
			],
			paramModes: [
				"audio",
				"audio",
				"scalar",
				"audio",
				"audio",
				"audio"
			],
			emitNames: ["inputLevel", "gainReduction"],
			usesInput: true
		},
		{
			id: 276,
			genName: "Compressor",
			variantName: "default",
			className: "Compressor_default_attack_audio_release_audio_threshold_audio_ratio_scalar_knee_scalar_key_scalar",
			paramNames: [
				"attack",
				"release",
				"threshold",
				"ratio",
				"knee",
				"key"
			],
			paramModes: [
				"audio",
				"audio",
				"audio",
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: ["inputLevel", "gainReduction"],
			usesInput: true
		},
		{
			id: 277,
			genName: "Compressor",
			variantName: "default",
			className: "Compressor_default_attack_audio_release_audio_threshold_audio_ratio_scalar_knee_scalar_key_audio",
			paramNames: [
				"attack",
				"release",
				"threshold",
				"ratio",
				"knee",
				"key"
			],
			paramModes: [
				"audio",
				"audio",
				"audio",
				"scalar",
				"scalar",
				"audio"
			],
			emitNames: ["inputLevel", "gainReduction"],
			usesInput: true
		},
		{
			id: 278,
			genName: "Compressor",
			variantName: "default",
			className: "Compressor_default_attack_audio_release_audio_threshold_audio_ratio_scalar_knee_audio_key_scalar",
			paramNames: [
				"attack",
				"release",
				"threshold",
				"ratio",
				"knee",
				"key"
			],
			paramModes: [
				"audio",
				"audio",
				"audio",
				"scalar",
				"audio",
				"scalar"
			],
			emitNames: ["inputLevel", "gainReduction"],
			usesInput: true
		},
		{
			id: 279,
			genName: "Compressor",
			variantName: "default",
			className: "Compressor_default_attack_audio_release_audio_threshold_audio_ratio_scalar_knee_audio_key_audio",
			paramNames: [
				"attack",
				"release",
				"threshold",
				"ratio",
				"knee",
				"key"
			],
			paramModes: [
				"audio",
				"audio",
				"audio",
				"scalar",
				"audio",
				"audio"
			],
			emitNames: ["inputLevel", "gainReduction"],
			usesInput: true
		},
		{
			id: 280,
			genName: "Compressor",
			variantName: "default",
			className: "Compressor_default_attack_audio_release_audio_threshold_audio_ratio_audio_knee_scalar_key_scalar",
			paramNames: [
				"attack",
				"release",
				"threshold",
				"ratio",
				"knee",
				"key"
			],
			paramModes: [
				"audio",
				"audio",
				"audio",
				"audio",
				"scalar",
				"scalar"
			],
			emitNames: ["inputLevel", "gainReduction"],
			usesInput: true
		},
		{
			id: 281,
			genName: "Compressor",
			variantName: "default",
			className: "Compressor_default_attack_audio_release_audio_threshold_audio_ratio_audio_knee_scalar_key_audio",
			paramNames: [
				"attack",
				"release",
				"threshold",
				"ratio",
				"knee",
				"key"
			],
			paramModes: [
				"audio",
				"audio",
				"audio",
				"audio",
				"scalar",
				"audio"
			],
			emitNames: ["inputLevel", "gainReduction"],
			usesInput: true
		},
		{
			id: 282,
			genName: "Compressor",
			variantName: "default",
			className: "Compressor_default_attack_audio_release_audio_threshold_audio_ratio_audio_knee_audio_key_scalar",
			paramNames: [
				"attack",
				"release",
				"threshold",
				"ratio",
				"knee",
				"key"
			],
			paramModes: [
				"audio",
				"audio",
				"audio",
				"audio",
				"audio",
				"scalar"
			],
			emitNames: ["inputLevel", "gainReduction"],
			usesInput: true
		},
		{
			id: 283,
			genName: "Compressor",
			variantName: "default",
			className: "Compressor_default_attack_audio_release_audio_threshold_audio_ratio_audio_knee_audio_key_audio",
			paramNames: [
				"attack",
				"release",
				"threshold",
				"ratio",
				"knee",
				"key"
			],
			paramModes: [
				"audio",
				"audio",
				"audio",
				"audio",
				"audio",
				"audio"
			],
			emitNames: ["inputLevel", "gainReduction"],
			usesInput: true
		},
		{
			id: 284,
			genName: "Emit",
			variantName: "default",
			className: "Emit_default_value_scalar",
			paramNames: ["value"],
			paramModes: ["scalar"],
			emitNames: [],
			usesInput: false
		},
		{
			id: 285,
			genName: "Emit",
			variantName: "default",
			className: "Emit_default_value_audio",
			paramNames: ["value"],
			paramModes: ["audio"],
			emitNames: [],
			usesInput: false
		},
		{
			id: 286,
			genName: "Fractal",
			variantName: "default",
			className: "Fractal_default_seed_scalar_rate_scalar_octaves_scalar_gain_scalar_trig_scalar",
			paramNames: [
				"seed",
				"rate",
				"octaves",
				"gain",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 287,
			genName: "Fractal",
			variantName: "default",
			className: "Fractal_default_seed_scalar_rate_scalar_octaves_scalar_gain_scalar_trig_audio",
			paramNames: [
				"seed",
				"rate",
				"octaves",
				"gain",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"audio"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 288,
			genName: "Fractal",
			variantName: "default",
			className: "Fractal_default_seed_scalar_rate_scalar_octaves_scalar_gain_audio_trig_scalar",
			paramNames: [
				"seed",
				"rate",
				"octaves",
				"gain",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"scalar",
				"audio",
				"scalar"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 289,
			genName: "Fractal",
			variantName: "default",
			className: "Fractal_default_seed_scalar_rate_scalar_octaves_scalar_gain_audio_trig_audio",
			paramNames: [
				"seed",
				"rate",
				"octaves",
				"gain",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"scalar",
				"audio",
				"audio"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 290,
			genName: "Fractal",
			variantName: "default",
			className: "Fractal_default_seed_scalar_rate_scalar_octaves_audio_gain_scalar_trig_scalar",
			paramNames: [
				"seed",
				"rate",
				"octaves",
				"gain",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"audio",
				"scalar",
				"scalar"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 291,
			genName: "Fractal",
			variantName: "default",
			className: "Fractal_default_seed_scalar_rate_scalar_octaves_audio_gain_scalar_trig_audio",
			paramNames: [
				"seed",
				"rate",
				"octaves",
				"gain",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"audio",
				"scalar",
				"audio"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 292,
			genName: "Fractal",
			variantName: "default",
			className: "Fractal_default_seed_scalar_rate_scalar_octaves_audio_gain_audio_trig_scalar",
			paramNames: [
				"seed",
				"rate",
				"octaves",
				"gain",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"audio",
				"audio",
				"scalar"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 293,
			genName: "Fractal",
			variantName: "default",
			className: "Fractal_default_seed_scalar_rate_scalar_octaves_audio_gain_audio_trig_audio",
			paramNames: [
				"seed",
				"rate",
				"octaves",
				"gain",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"audio",
				"audio",
				"audio"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 294,
			genName: "Fractal",
			variantName: "default",
			className: "Fractal_default_seed_scalar_rate_audio_octaves_scalar_gain_scalar_trig_scalar",
			paramNames: [
				"seed",
				"rate",
				"octaves",
				"gain",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 295,
			genName: "Fractal",
			variantName: "default",
			className: "Fractal_default_seed_scalar_rate_audio_octaves_scalar_gain_scalar_trig_audio",
			paramNames: [
				"seed",
				"rate",
				"octaves",
				"gain",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"scalar",
				"scalar",
				"audio"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 296,
			genName: "Fractal",
			variantName: "default",
			className: "Fractal_default_seed_scalar_rate_audio_octaves_scalar_gain_audio_trig_scalar",
			paramNames: [
				"seed",
				"rate",
				"octaves",
				"gain",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"scalar",
				"audio",
				"scalar"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 297,
			genName: "Fractal",
			variantName: "default",
			className: "Fractal_default_seed_scalar_rate_audio_octaves_scalar_gain_audio_trig_audio",
			paramNames: [
				"seed",
				"rate",
				"octaves",
				"gain",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"scalar",
				"audio",
				"audio"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 298,
			genName: "Fractal",
			variantName: "default",
			className: "Fractal_default_seed_scalar_rate_audio_octaves_audio_gain_scalar_trig_scalar",
			paramNames: [
				"seed",
				"rate",
				"octaves",
				"gain",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"audio",
				"scalar",
				"scalar"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 299,
			genName: "Fractal",
			variantName: "default",
			className: "Fractal_default_seed_scalar_rate_audio_octaves_audio_gain_scalar_trig_audio",
			paramNames: [
				"seed",
				"rate",
				"octaves",
				"gain",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"audio",
				"scalar",
				"audio"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 300,
			genName: "Fractal",
			variantName: "default",
			className: "Fractal_default_seed_scalar_rate_audio_octaves_audio_gain_audio_trig_scalar",
			paramNames: [
				"seed",
				"rate",
				"octaves",
				"gain",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"audio",
				"audio",
				"scalar"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 301,
			genName: "Fractal",
			variantName: "default",
			className: "Fractal_default_seed_scalar_rate_audio_octaves_audio_gain_audio_trig_audio",
			paramNames: [
				"seed",
				"rate",
				"octaves",
				"gain",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"audio",
				"audio",
				"audio"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 302,
			genName: "Lforamp",
			variantName: "default",
			className: "Lforamp_default_bar_scalar_offset_scalar_trig_scalar",
			paramNames: [
				"bar",
				"offset",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 303,
			genName: "Lforamp",
			variantName: "default",
			className: "Lforamp_default_bar_scalar_offset_scalar_trig_audio",
			paramNames: [
				"bar",
				"offset",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"audio"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 304,
			genName: "Lforamp",
			variantName: "default",
			className: "Lforamp_default_bar_scalar_offset_audio_trig_scalar",
			paramNames: [
				"bar",
				"offset",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"scalar"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 305,
			genName: "Lforamp",
			variantName: "default",
			className: "Lforamp_default_bar_scalar_offset_audio_trig_audio",
			paramNames: [
				"bar",
				"offset",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"audio"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 306,
			genName: "Lforamp",
			variantName: "default",
			className: "Lforamp_default_bar_audio_offset_scalar_trig_scalar",
			paramNames: [
				"bar",
				"offset",
				"trig"
			],
			paramModes: [
				"audio",
				"scalar",
				"scalar"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 307,
			genName: "Lforamp",
			variantName: "default",
			className: "Lforamp_default_bar_audio_offset_scalar_trig_audio",
			paramNames: [
				"bar",
				"offset",
				"trig"
			],
			paramModes: [
				"audio",
				"scalar",
				"audio"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 308,
			genName: "Lforamp",
			variantName: "default",
			className: "Lforamp_default_bar_audio_offset_audio_trig_scalar",
			paramNames: [
				"bar",
				"offset",
				"trig"
			],
			paramModes: [
				"audio",
				"audio",
				"scalar"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 309,
			genName: "Lforamp",
			variantName: "default",
			className: "Lforamp_default_bar_audio_offset_audio_trig_audio",
			paramNames: [
				"bar",
				"offset",
				"trig"
			],
			paramModes: [
				"audio",
				"audio",
				"audio"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 310,
			genName: "Tri",
			variantName: "default",
			className: "Tri_default_hz_scalar_offset_scalar_trig_scalar",
			paramNames: [
				"hz",
				"offset",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: [],
			usesInput: false
		},
		{
			id: 311,
			genName: "Tri",
			variantName: "default",
			className: "Tri_default_hz_scalar_offset_scalar_trig_audio",
			paramNames: [
				"hz",
				"offset",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"audio"
			],
			emitNames: [],
			usesInput: false
		},
		{
			id: 312,
			genName: "Tri",
			variantName: "default",
			className: "Tri_default_hz_scalar_offset_audio_trig_scalar",
			paramNames: [
				"hz",
				"offset",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"scalar"
			],
			emitNames: [],
			usesInput: false
		},
		{
			id: 313,
			genName: "Tri",
			variantName: "default",
			className: "Tri_default_hz_scalar_offset_audio_trig_audio",
			paramNames: [
				"hz",
				"offset",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"audio"
			],
			emitNames: [],
			usesInput: false
		},
		{
			id: 314,
			genName: "Tri",
			variantName: "default",
			className: "Tri_default_hz_audio_offset_scalar_trig_scalar",
			paramNames: [
				"hz",
				"offset",
				"trig"
			],
			paramModes: [
				"audio",
				"scalar",
				"scalar"
			],
			emitNames: [],
			usesInput: false
		},
		{
			id: 315,
			genName: "Tri",
			variantName: "default",
			className: "Tri_default_hz_audio_offset_scalar_trig_audio",
			paramNames: [
				"hz",
				"offset",
				"trig"
			],
			paramModes: [
				"audio",
				"scalar",
				"audio"
			],
			emitNames: [],
			usesInput: false
		},
		{
			id: 316,
			genName: "Tri",
			variantName: "default",
			className: "Tri_default_hz_audio_offset_audio_trig_scalar",
			paramNames: [
				"hz",
				"offset",
				"trig"
			],
			paramModes: [
				"audio",
				"audio",
				"scalar"
			],
			emitNames: [],
			usesInput: false
		},
		{
			id: 317,
			genName: "Tri",
			variantName: "default",
			className: "Tri_default_hz_audio_offset_audio_trig_audio",
			paramNames: [
				"hz",
				"offset",
				"trig"
			],
			paramModes: [
				"audio",
				"audio",
				"audio"
			],
			emitNames: [],
			usesInput: false
		},
		{
			id: 318,
			genName: "Pitchshift",
			variantName: "default",
			className: "Pitchshift_default_ratio_scalar",
			paramNames: ["ratio"],
			paramModes: ["scalar"],
			emitNames: [],
			usesInput: true
		},
		{
			id: 319,
			genName: "Pitchshift",
			variantName: "default",
			className: "Pitchshift_default_ratio_audio",
			paramNames: ["ratio"],
			paramModes: ["audio"],
			emitNames: [],
			usesInput: true
		},
		{
			id: 320,
			genName: "Zerox",
			variantName: "default",
			className: "Zerox_default_",
			paramNames: [],
			paramModes: [],
			emitNames: [],
			usesInput: true
		},
		{
			id: 321,
			genName: "Limiter",
			variantName: "default",
			className: "Limiter_default_threshold_scalar_release_scalar",
			paramNames: ["threshold", "release"],
			paramModes: ["scalar", "scalar"],
			emitNames: [],
			usesInput: true
		},
		{
			id: 322,
			genName: "Limiter",
			variantName: "default",
			className: "Limiter_default_threshold_scalar_release_audio",
			paramNames: ["threshold", "release"],
			paramModes: ["scalar", "audio"],
			emitNames: [],
			usesInput: true
		},
		{
			id: 323,
			genName: "Limiter",
			variantName: "default",
			className: "Limiter_default_threshold_audio_release_scalar",
			paramNames: ["threshold", "release"],
			paramModes: ["audio", "scalar"],
			emitNames: [],
			usesInput: true
		},
		{
			id: 324,
			genName: "Limiter",
			variantName: "default",
			className: "Limiter_default_threshold_audio_release_audio",
			paramNames: ["threshold", "release"],
			paramModes: ["audio", "audio"],
			emitNames: [],
			usesInput: true
		},
		{
			id: 325,
			genName: "At",
			variantName: "default",
			className: "At_default_bar_scalar_every_scalar_prob_scalar_seed_scalar",
			paramNames: [
				"bar",
				"every",
				"prob",
				"seed"
			],
			paramModes: [
				"scalar",
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: ["fired"],
			usesInput: false
		},
		{
			id: 326,
			genName: "At",
			variantName: "default",
			className: "At_default_bar_scalar_every_scalar_prob_audio_seed_scalar",
			paramNames: [
				"bar",
				"every",
				"prob",
				"seed"
			],
			paramModes: [
				"scalar",
				"scalar",
				"audio",
				"scalar"
			],
			emitNames: ["fired"],
			usesInput: false
		},
		{
			id: 327,
			genName: "At",
			variantName: "default",
			className: "At_default_bar_scalar_every_audio_prob_scalar_seed_scalar",
			paramNames: [
				"bar",
				"every",
				"prob",
				"seed"
			],
			paramModes: [
				"scalar",
				"audio",
				"scalar",
				"scalar"
			],
			emitNames: ["fired"],
			usesInput: false
		},
		{
			id: 328,
			genName: "At",
			variantName: "default",
			className: "At_default_bar_scalar_every_audio_prob_audio_seed_scalar",
			paramNames: [
				"bar",
				"every",
				"prob",
				"seed"
			],
			paramModes: [
				"scalar",
				"audio",
				"audio",
				"scalar"
			],
			emitNames: ["fired"],
			usesInput: false
		},
		{
			id: 329,
			genName: "At",
			variantName: "default",
			className: "At_default_bar_audio_every_scalar_prob_scalar_seed_scalar",
			paramNames: [
				"bar",
				"every",
				"prob",
				"seed"
			],
			paramModes: [
				"audio",
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: ["fired"],
			usesInput: false
		},
		{
			id: 330,
			genName: "At",
			variantName: "default",
			className: "At_default_bar_audio_every_scalar_prob_audio_seed_scalar",
			paramNames: [
				"bar",
				"every",
				"prob",
				"seed"
			],
			paramModes: [
				"audio",
				"scalar",
				"audio",
				"scalar"
			],
			emitNames: ["fired"],
			usesInput: false
		},
		{
			id: 331,
			genName: "At",
			variantName: "default",
			className: "At_default_bar_audio_every_audio_prob_scalar_seed_scalar",
			paramNames: [
				"bar",
				"every",
				"prob",
				"seed"
			],
			paramModes: [
				"audio",
				"audio",
				"scalar",
				"scalar"
			],
			emitNames: ["fired"],
			usesInput: false
		},
		{
			id: 332,
			genName: "At",
			variantName: "default",
			className: "At_default_bar_audio_every_audio_prob_audio_seed_scalar",
			paramNames: [
				"bar",
				"every",
				"prob",
				"seed"
			],
			paramModes: [
				"audio",
				"audio",
				"audio",
				"scalar"
			],
			emitNames: ["fired"],
			usesInput: false
		},
		{
			id: 333,
			genName: "Diodeladder",
			variantName: "default",
			className: "Diodeladder_default_cutoff_scalar_q_scalar_k_scalar_sat_scalar",
			paramNames: [
				"cutoff",
				"q",
				"k",
				"sat"
			],
			paramModes: [
				"scalar",
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 334,
			genName: "Diodeladder",
			variantName: "default",
			className: "Diodeladder_default_cutoff_scalar_q_scalar_k_scalar_sat_audio",
			paramNames: [
				"cutoff",
				"q",
				"k",
				"sat"
			],
			paramModes: [
				"scalar",
				"scalar",
				"scalar",
				"audio"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 335,
			genName: "Diodeladder",
			variantName: "default",
			className: "Diodeladder_default_cutoff_scalar_q_scalar_k_audio_sat_scalar",
			paramNames: [
				"cutoff",
				"q",
				"k",
				"sat"
			],
			paramModes: [
				"scalar",
				"scalar",
				"audio",
				"scalar"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 336,
			genName: "Diodeladder",
			variantName: "default",
			className: "Diodeladder_default_cutoff_scalar_q_scalar_k_audio_sat_audio",
			paramNames: [
				"cutoff",
				"q",
				"k",
				"sat"
			],
			paramModes: [
				"scalar",
				"scalar",
				"audio",
				"audio"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 337,
			genName: "Diodeladder",
			variantName: "default",
			className: "Diodeladder_default_cutoff_scalar_q_audio_k_scalar_sat_scalar",
			paramNames: [
				"cutoff",
				"q",
				"k",
				"sat"
			],
			paramModes: [
				"scalar",
				"audio",
				"scalar",
				"scalar"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 338,
			genName: "Diodeladder",
			variantName: "default",
			className: "Diodeladder_default_cutoff_scalar_q_audio_k_scalar_sat_audio",
			paramNames: [
				"cutoff",
				"q",
				"k",
				"sat"
			],
			paramModes: [
				"scalar",
				"audio",
				"scalar",
				"audio"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 339,
			genName: "Diodeladder",
			variantName: "default",
			className: "Diodeladder_default_cutoff_scalar_q_audio_k_audio_sat_scalar",
			paramNames: [
				"cutoff",
				"q",
				"k",
				"sat"
			],
			paramModes: [
				"scalar",
				"audio",
				"audio",
				"scalar"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 340,
			genName: "Diodeladder",
			variantName: "default",
			className: "Diodeladder_default_cutoff_scalar_q_audio_k_audio_sat_audio",
			paramNames: [
				"cutoff",
				"q",
				"k",
				"sat"
			],
			paramModes: [
				"scalar",
				"audio",
				"audio",
				"audio"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 341,
			genName: "Diodeladder",
			variantName: "default",
			className: "Diodeladder_default_cutoff_audio_q_scalar_k_scalar_sat_scalar",
			paramNames: [
				"cutoff",
				"q",
				"k",
				"sat"
			],
			paramModes: [
				"audio",
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 342,
			genName: "Diodeladder",
			variantName: "default",
			className: "Diodeladder_default_cutoff_audio_q_scalar_k_scalar_sat_audio",
			paramNames: [
				"cutoff",
				"q",
				"k",
				"sat"
			],
			paramModes: [
				"audio",
				"scalar",
				"scalar",
				"audio"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 343,
			genName: "Diodeladder",
			variantName: "default",
			className: "Diodeladder_default_cutoff_audio_q_scalar_k_audio_sat_scalar",
			paramNames: [
				"cutoff",
				"q",
				"k",
				"sat"
			],
			paramModes: [
				"audio",
				"scalar",
				"audio",
				"scalar"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 344,
			genName: "Diodeladder",
			variantName: "default",
			className: "Diodeladder_default_cutoff_audio_q_scalar_k_audio_sat_audio",
			paramNames: [
				"cutoff",
				"q",
				"k",
				"sat"
			],
			paramModes: [
				"audio",
				"scalar",
				"audio",
				"audio"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 345,
			genName: "Diodeladder",
			variantName: "default",
			className: "Diodeladder_default_cutoff_audio_q_audio_k_scalar_sat_scalar",
			paramNames: [
				"cutoff",
				"q",
				"k",
				"sat"
			],
			paramModes: [
				"audio",
				"audio",
				"scalar",
				"scalar"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 346,
			genName: "Diodeladder",
			variantName: "default",
			className: "Diodeladder_default_cutoff_audio_q_audio_k_scalar_sat_audio",
			paramNames: [
				"cutoff",
				"q",
				"k",
				"sat"
			],
			paramModes: [
				"audio",
				"audio",
				"scalar",
				"audio"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 347,
			genName: "Diodeladder",
			variantName: "default",
			className: "Diodeladder_default_cutoff_audio_q_audio_k_audio_sat_scalar",
			paramNames: [
				"cutoff",
				"q",
				"k",
				"sat"
			],
			paramModes: [
				"audio",
				"audio",
				"audio",
				"scalar"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 348,
			genName: "Diodeladder",
			variantName: "default",
			className: "Diodeladder_default_cutoff_audio_q_audio_k_audio_sat_audio",
			paramNames: [
				"cutoff",
				"q",
				"k",
				"sat"
			],
			paramModes: [
				"audio",
				"audio",
				"audio",
				"audio"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 349,
			genName: "Ramp",
			variantName: "default",
			className: "Ramp_default_hz_scalar_offset_scalar_trig_scalar",
			paramNames: [
				"hz",
				"offset",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: [],
			usesInput: false
		},
		{
			id: 350,
			genName: "Ramp",
			variantName: "default",
			className: "Ramp_default_hz_scalar_offset_scalar_trig_audio",
			paramNames: [
				"hz",
				"offset",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"audio"
			],
			emitNames: [],
			usesInput: false
		},
		{
			id: 351,
			genName: "Ramp",
			variantName: "default",
			className: "Ramp_default_hz_scalar_offset_audio_trig_scalar",
			paramNames: [
				"hz",
				"offset",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"scalar"
			],
			emitNames: [],
			usesInput: false
		},
		{
			id: 352,
			genName: "Ramp",
			variantName: "default",
			className: "Ramp_default_hz_scalar_offset_audio_trig_audio",
			paramNames: [
				"hz",
				"offset",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"audio"
			],
			emitNames: [],
			usesInput: false
		},
		{
			id: 353,
			genName: "Ramp",
			variantName: "default",
			className: "Ramp_default_hz_audio_offset_scalar_trig_scalar",
			paramNames: [
				"hz",
				"offset",
				"trig"
			],
			paramModes: [
				"audio",
				"scalar",
				"scalar"
			],
			emitNames: [],
			usesInput: false
		},
		{
			id: 354,
			genName: "Ramp",
			variantName: "default",
			className: "Ramp_default_hz_audio_offset_scalar_trig_audio",
			paramNames: [
				"hz",
				"offset",
				"trig"
			],
			paramModes: [
				"audio",
				"scalar",
				"audio"
			],
			emitNames: [],
			usesInput: false
		},
		{
			id: 355,
			genName: "Ramp",
			variantName: "default",
			className: "Ramp_default_hz_audio_offset_audio_trig_scalar",
			paramNames: [
				"hz",
				"offset",
				"trig"
			],
			paramModes: [
				"audio",
				"audio",
				"scalar"
			],
			emitNames: [],
			usesInput: false
		},
		{
			id: 356,
			genName: "Ramp",
			variantName: "default",
			className: "Ramp_default_hz_audio_offset_audio_trig_audio",
			paramNames: [
				"hz",
				"offset",
				"trig"
			],
			paramModes: [
				"audio",
				"audio",
				"audio"
			],
			emitNames: [],
			usesInput: false
		},
		{
			id: 357,
			genName: "Smooth",
			variantName: "default",
			className: "Smooth_default_seed_scalar_rate_scalar_curve_scalar_trig_scalar",
			paramNames: [
				"seed",
				"rate",
				"curve",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 358,
			genName: "Smooth",
			variantName: "default",
			className: "Smooth_default_seed_scalar_rate_scalar_curve_scalar_trig_audio",
			paramNames: [
				"seed",
				"rate",
				"curve",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"scalar",
				"audio"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 359,
			genName: "Smooth",
			variantName: "default",
			className: "Smooth_default_seed_scalar_rate_scalar_curve_audio_trig_scalar",
			paramNames: [
				"seed",
				"rate",
				"curve",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"audio",
				"scalar"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 360,
			genName: "Smooth",
			variantName: "default",
			className: "Smooth_default_seed_scalar_rate_scalar_curve_audio_trig_audio",
			paramNames: [
				"seed",
				"rate",
				"curve",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"audio",
				"audio"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 361,
			genName: "Smooth",
			variantName: "default",
			className: "Smooth_default_seed_scalar_rate_audio_curve_scalar_trig_scalar",
			paramNames: [
				"seed",
				"rate",
				"curve",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"scalar",
				"scalar"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 362,
			genName: "Smooth",
			variantName: "default",
			className: "Smooth_default_seed_scalar_rate_audio_curve_scalar_trig_audio",
			paramNames: [
				"seed",
				"rate",
				"curve",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"scalar",
				"audio"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 363,
			genName: "Smooth",
			variantName: "default",
			className: "Smooth_default_seed_scalar_rate_audio_curve_audio_trig_scalar",
			paramNames: [
				"seed",
				"rate",
				"curve",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"audio",
				"scalar"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 364,
			genName: "Smooth",
			variantName: "default",
			className: "Smooth_default_seed_scalar_rate_audio_curve_audio_trig_audio",
			paramNames: [
				"seed",
				"rate",
				"curve",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"audio",
				"audio"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 365,
			genName: "Lfotri",
			variantName: "default",
			className: "Lfotri_default_bar_scalar_offset_scalar_trig_scalar",
			paramNames: [
				"bar",
				"offset",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 366,
			genName: "Lfotri",
			variantName: "default",
			className: "Lfotri_default_bar_scalar_offset_scalar_trig_audio",
			paramNames: [
				"bar",
				"offset",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"audio"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 367,
			genName: "Lfotri",
			variantName: "default",
			className: "Lfotri_default_bar_scalar_offset_audio_trig_scalar",
			paramNames: [
				"bar",
				"offset",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"scalar"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 368,
			genName: "Lfotri",
			variantName: "default",
			className: "Lfotri_default_bar_scalar_offset_audio_trig_audio",
			paramNames: [
				"bar",
				"offset",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"audio"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 369,
			genName: "Lfotri",
			variantName: "default",
			className: "Lfotri_default_bar_audio_offset_scalar_trig_scalar",
			paramNames: [
				"bar",
				"offset",
				"trig"
			],
			paramModes: [
				"audio",
				"scalar",
				"scalar"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 370,
			genName: "Lfotri",
			variantName: "default",
			className: "Lfotri_default_bar_audio_offset_scalar_trig_audio",
			paramNames: [
				"bar",
				"offset",
				"trig"
			],
			paramModes: [
				"audio",
				"scalar",
				"audio"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 371,
			genName: "Lfotri",
			variantName: "default",
			className: "Lfotri_default_bar_audio_offset_audio_trig_scalar",
			paramNames: [
				"bar",
				"offset",
				"trig"
			],
			paramModes: [
				"audio",
				"audio",
				"scalar"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 372,
			genName: "Lfotri",
			variantName: "default",
			className: "Lfotri_default_bar_audio_offset_audio_trig_audio",
			paramNames: [
				"bar",
				"offset",
				"trig"
			],
			paramModes: [
				"audio",
				"audio",
				"audio"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 373,
			genName: "Adsr",
			variantName: "default",
			className: "Adsr_default_attack_scalar_decay_scalar_sustain_scalar_release_scalar_exponent_scalar_trig_scalar",
			paramNames: [
				"attack",
				"decay",
				"sustain",
				"release",
				"exponent",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: ["stage", "env"],
			usesInput: false
		},
		{
			id: 374,
			genName: "Adsr",
			variantName: "default",
			className: "Adsr_default_attack_scalar_decay_scalar_sustain_scalar_release_scalar_exponent_scalar_trig_audio",
			paramNames: [
				"attack",
				"decay",
				"sustain",
				"release",
				"exponent",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"audio"
			],
			emitNames: ["stage", "env"],
			usesInput: false
		},
		{
			id: 375,
			genName: "Adsr",
			variantName: "default",
			className: "Adsr_default_attack_scalar_decay_scalar_sustain_scalar_release_scalar_exponent_audio_trig_scalar",
			paramNames: [
				"attack",
				"decay",
				"sustain",
				"release",
				"exponent",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"audio",
				"scalar"
			],
			emitNames: ["stage", "env"],
			usesInput: false
		},
		{
			id: 376,
			genName: "Adsr",
			variantName: "default",
			className: "Adsr_default_attack_scalar_decay_scalar_sustain_scalar_release_scalar_exponent_audio_trig_audio",
			paramNames: [
				"attack",
				"decay",
				"sustain",
				"release",
				"exponent",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"audio",
				"audio"
			],
			emitNames: ["stage", "env"],
			usesInput: false
		},
		{
			id: 377,
			genName: "Adsr",
			variantName: "default",
			className: "Adsr_default_attack_scalar_decay_scalar_sustain_scalar_release_audio_exponent_scalar_trig_scalar",
			paramNames: [
				"attack",
				"decay",
				"sustain",
				"release",
				"exponent",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"scalar",
				"audio",
				"scalar",
				"scalar"
			],
			emitNames: ["stage", "env"],
			usesInput: false
		},
		{
			id: 378,
			genName: "Adsr",
			variantName: "default",
			className: "Adsr_default_attack_scalar_decay_scalar_sustain_scalar_release_audio_exponent_scalar_trig_audio",
			paramNames: [
				"attack",
				"decay",
				"sustain",
				"release",
				"exponent",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"scalar",
				"audio",
				"scalar",
				"audio"
			],
			emitNames: ["stage", "env"],
			usesInput: false
		},
		{
			id: 379,
			genName: "Adsr",
			variantName: "default",
			className: "Adsr_default_attack_scalar_decay_scalar_sustain_scalar_release_audio_exponent_audio_trig_scalar",
			paramNames: [
				"attack",
				"decay",
				"sustain",
				"release",
				"exponent",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"scalar",
				"audio",
				"audio",
				"scalar"
			],
			emitNames: ["stage", "env"],
			usesInput: false
		},
		{
			id: 380,
			genName: "Adsr",
			variantName: "default",
			className: "Adsr_default_attack_scalar_decay_scalar_sustain_scalar_release_audio_exponent_audio_trig_audio",
			paramNames: [
				"attack",
				"decay",
				"sustain",
				"release",
				"exponent",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"scalar",
				"audio",
				"audio",
				"audio"
			],
			emitNames: ["stage", "env"],
			usesInput: false
		},
		{
			id: 381,
			genName: "Adsr",
			variantName: "default",
			className: "Adsr_default_attack_scalar_decay_scalar_sustain_audio_release_scalar_exponent_scalar_trig_scalar",
			paramNames: [
				"attack",
				"decay",
				"sustain",
				"release",
				"exponent",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"audio",
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: ["stage", "env"],
			usesInput: false
		},
		{
			id: 382,
			genName: "Adsr",
			variantName: "default",
			className: "Adsr_default_attack_scalar_decay_scalar_sustain_audio_release_scalar_exponent_scalar_trig_audio",
			paramNames: [
				"attack",
				"decay",
				"sustain",
				"release",
				"exponent",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"audio",
				"scalar",
				"scalar",
				"audio"
			],
			emitNames: ["stage", "env"],
			usesInput: false
		},
		{
			id: 383,
			genName: "Adsr",
			variantName: "default",
			className: "Adsr_default_attack_scalar_decay_scalar_sustain_audio_release_scalar_exponent_audio_trig_scalar",
			paramNames: [
				"attack",
				"decay",
				"sustain",
				"release",
				"exponent",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"audio",
				"scalar",
				"audio",
				"scalar"
			],
			emitNames: ["stage", "env"],
			usesInput: false
		},
		{
			id: 384,
			genName: "Adsr",
			variantName: "default",
			className: "Adsr_default_attack_scalar_decay_scalar_sustain_audio_release_scalar_exponent_audio_trig_audio",
			paramNames: [
				"attack",
				"decay",
				"sustain",
				"release",
				"exponent",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"audio",
				"scalar",
				"audio",
				"audio"
			],
			emitNames: ["stage", "env"],
			usesInput: false
		},
		{
			id: 385,
			genName: "Adsr",
			variantName: "default",
			className: "Adsr_default_attack_scalar_decay_scalar_sustain_audio_release_audio_exponent_scalar_trig_scalar",
			paramNames: [
				"attack",
				"decay",
				"sustain",
				"release",
				"exponent",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"audio",
				"audio",
				"scalar",
				"scalar"
			],
			emitNames: ["stage", "env"],
			usesInput: false
		},
		{
			id: 386,
			genName: "Adsr",
			variantName: "default",
			className: "Adsr_default_attack_scalar_decay_scalar_sustain_audio_release_audio_exponent_scalar_trig_audio",
			paramNames: [
				"attack",
				"decay",
				"sustain",
				"release",
				"exponent",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"audio",
				"audio",
				"scalar",
				"audio"
			],
			emitNames: ["stage", "env"],
			usesInput: false
		},
		{
			id: 387,
			genName: "Adsr",
			variantName: "default",
			className: "Adsr_default_attack_scalar_decay_scalar_sustain_audio_release_audio_exponent_audio_trig_scalar",
			paramNames: [
				"attack",
				"decay",
				"sustain",
				"release",
				"exponent",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"audio",
				"audio",
				"audio",
				"scalar"
			],
			emitNames: ["stage", "env"],
			usesInput: false
		},
		{
			id: 388,
			genName: "Adsr",
			variantName: "default",
			className: "Adsr_default_attack_scalar_decay_scalar_sustain_audio_release_audio_exponent_audio_trig_audio",
			paramNames: [
				"attack",
				"decay",
				"sustain",
				"release",
				"exponent",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"audio",
				"audio",
				"audio",
				"audio"
			],
			emitNames: ["stage", "env"],
			usesInput: false
		},
		{
			id: 389,
			genName: "Adsr",
			variantName: "default",
			className: "Adsr_default_attack_scalar_decay_audio_sustain_scalar_release_scalar_exponent_scalar_trig_scalar",
			paramNames: [
				"attack",
				"decay",
				"sustain",
				"release",
				"exponent",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"scalar",
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: ["stage", "env"],
			usesInput: false
		},
		{
			id: 390,
			genName: "Adsr",
			variantName: "default",
			className: "Adsr_default_attack_scalar_decay_audio_sustain_scalar_release_scalar_exponent_scalar_trig_audio",
			paramNames: [
				"attack",
				"decay",
				"sustain",
				"release",
				"exponent",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"scalar",
				"scalar",
				"scalar",
				"audio"
			],
			emitNames: ["stage", "env"],
			usesInput: false
		},
		{
			id: 391,
			genName: "Adsr",
			variantName: "default",
			className: "Adsr_default_attack_scalar_decay_audio_sustain_scalar_release_scalar_exponent_audio_trig_scalar",
			paramNames: [
				"attack",
				"decay",
				"sustain",
				"release",
				"exponent",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"scalar",
				"scalar",
				"audio",
				"scalar"
			],
			emitNames: ["stage", "env"],
			usesInput: false
		},
		{
			id: 392,
			genName: "Adsr",
			variantName: "default",
			className: "Adsr_default_attack_scalar_decay_audio_sustain_scalar_release_scalar_exponent_audio_trig_audio",
			paramNames: [
				"attack",
				"decay",
				"sustain",
				"release",
				"exponent",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"scalar",
				"scalar",
				"audio",
				"audio"
			],
			emitNames: ["stage", "env"],
			usesInput: false
		},
		{
			id: 393,
			genName: "Adsr",
			variantName: "default",
			className: "Adsr_default_attack_scalar_decay_audio_sustain_scalar_release_audio_exponent_scalar_trig_scalar",
			paramNames: [
				"attack",
				"decay",
				"sustain",
				"release",
				"exponent",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"scalar",
				"audio",
				"scalar",
				"scalar"
			],
			emitNames: ["stage", "env"],
			usesInput: false
		},
		{
			id: 394,
			genName: "Adsr",
			variantName: "default",
			className: "Adsr_default_attack_scalar_decay_audio_sustain_scalar_release_audio_exponent_scalar_trig_audio",
			paramNames: [
				"attack",
				"decay",
				"sustain",
				"release",
				"exponent",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"scalar",
				"audio",
				"scalar",
				"audio"
			],
			emitNames: ["stage", "env"],
			usesInput: false
		},
		{
			id: 395,
			genName: "Adsr",
			variantName: "default",
			className: "Adsr_default_attack_scalar_decay_audio_sustain_scalar_release_audio_exponent_audio_trig_scalar",
			paramNames: [
				"attack",
				"decay",
				"sustain",
				"release",
				"exponent",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"scalar",
				"audio",
				"audio",
				"scalar"
			],
			emitNames: ["stage", "env"],
			usesInput: false
		},
		{
			id: 396,
			genName: "Adsr",
			variantName: "default",
			className: "Adsr_default_attack_scalar_decay_audio_sustain_scalar_release_audio_exponent_audio_trig_audio",
			paramNames: [
				"attack",
				"decay",
				"sustain",
				"release",
				"exponent",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"scalar",
				"audio",
				"audio",
				"audio"
			],
			emitNames: ["stage", "env"],
			usesInput: false
		},
		{
			id: 397,
			genName: "Adsr",
			variantName: "default",
			className: "Adsr_default_attack_scalar_decay_audio_sustain_audio_release_scalar_exponent_scalar_trig_scalar",
			paramNames: [
				"attack",
				"decay",
				"sustain",
				"release",
				"exponent",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"audio",
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: ["stage", "env"],
			usesInput: false
		},
		{
			id: 398,
			genName: "Adsr",
			variantName: "default",
			className: "Adsr_default_attack_scalar_decay_audio_sustain_audio_release_scalar_exponent_scalar_trig_audio",
			paramNames: [
				"attack",
				"decay",
				"sustain",
				"release",
				"exponent",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"audio",
				"scalar",
				"scalar",
				"audio"
			],
			emitNames: ["stage", "env"],
			usesInput: false
		},
		{
			id: 399,
			genName: "Adsr",
			variantName: "default",
			className: "Adsr_default_attack_scalar_decay_audio_sustain_audio_release_scalar_exponent_audio_trig_scalar",
			paramNames: [
				"attack",
				"decay",
				"sustain",
				"release",
				"exponent",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"audio",
				"scalar",
				"audio",
				"scalar"
			],
			emitNames: ["stage", "env"],
			usesInput: false
		},
		{
			id: 400,
			genName: "Adsr",
			variantName: "default",
			className: "Adsr_default_attack_scalar_decay_audio_sustain_audio_release_scalar_exponent_audio_trig_audio",
			paramNames: [
				"attack",
				"decay",
				"sustain",
				"release",
				"exponent",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"audio",
				"scalar",
				"audio",
				"audio"
			],
			emitNames: ["stage", "env"],
			usesInput: false
		},
		{
			id: 401,
			genName: "Adsr",
			variantName: "default",
			className: "Adsr_default_attack_scalar_decay_audio_sustain_audio_release_audio_exponent_scalar_trig_scalar",
			paramNames: [
				"attack",
				"decay",
				"sustain",
				"release",
				"exponent",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"audio",
				"audio",
				"scalar",
				"scalar"
			],
			emitNames: ["stage", "env"],
			usesInput: false
		},
		{
			id: 402,
			genName: "Adsr",
			variantName: "default",
			className: "Adsr_default_attack_scalar_decay_audio_sustain_audio_release_audio_exponent_scalar_trig_audio",
			paramNames: [
				"attack",
				"decay",
				"sustain",
				"release",
				"exponent",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"audio",
				"audio",
				"scalar",
				"audio"
			],
			emitNames: ["stage", "env"],
			usesInput: false
		},
		{
			id: 403,
			genName: "Adsr",
			variantName: "default",
			className: "Adsr_default_attack_scalar_decay_audio_sustain_audio_release_audio_exponent_audio_trig_scalar",
			paramNames: [
				"attack",
				"decay",
				"sustain",
				"release",
				"exponent",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"audio",
				"audio",
				"audio",
				"scalar"
			],
			emitNames: ["stage", "env"],
			usesInput: false
		},
		{
			id: 404,
			genName: "Adsr",
			variantName: "default",
			className: "Adsr_default_attack_scalar_decay_audio_sustain_audio_release_audio_exponent_audio_trig_audio",
			paramNames: [
				"attack",
				"decay",
				"sustain",
				"release",
				"exponent",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"audio",
				"audio",
				"audio",
				"audio"
			],
			emitNames: ["stage", "env"],
			usesInput: false
		},
		{
			id: 405,
			genName: "Adsr",
			variantName: "default",
			className: "Adsr_default_attack_audio_decay_scalar_sustain_scalar_release_scalar_exponent_scalar_trig_scalar",
			paramNames: [
				"attack",
				"decay",
				"sustain",
				"release",
				"exponent",
				"trig"
			],
			paramModes: [
				"audio",
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: ["stage", "env"],
			usesInput: false
		},
		{
			id: 406,
			genName: "Adsr",
			variantName: "default",
			className: "Adsr_default_attack_audio_decay_scalar_sustain_scalar_release_scalar_exponent_scalar_trig_audio",
			paramNames: [
				"attack",
				"decay",
				"sustain",
				"release",
				"exponent",
				"trig"
			],
			paramModes: [
				"audio",
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"audio"
			],
			emitNames: ["stage", "env"],
			usesInput: false
		},
		{
			id: 407,
			genName: "Adsr",
			variantName: "default",
			className: "Adsr_default_attack_audio_decay_scalar_sustain_scalar_release_scalar_exponent_audio_trig_scalar",
			paramNames: [
				"attack",
				"decay",
				"sustain",
				"release",
				"exponent",
				"trig"
			],
			paramModes: [
				"audio",
				"scalar",
				"scalar",
				"scalar",
				"audio",
				"scalar"
			],
			emitNames: ["stage", "env"],
			usesInput: false
		},
		{
			id: 408,
			genName: "Adsr",
			variantName: "default",
			className: "Adsr_default_attack_audio_decay_scalar_sustain_scalar_release_scalar_exponent_audio_trig_audio",
			paramNames: [
				"attack",
				"decay",
				"sustain",
				"release",
				"exponent",
				"trig"
			],
			paramModes: [
				"audio",
				"scalar",
				"scalar",
				"scalar",
				"audio",
				"audio"
			],
			emitNames: ["stage", "env"],
			usesInput: false
		},
		{
			id: 409,
			genName: "Adsr",
			variantName: "default",
			className: "Adsr_default_attack_audio_decay_scalar_sustain_scalar_release_audio_exponent_scalar_trig_scalar",
			paramNames: [
				"attack",
				"decay",
				"sustain",
				"release",
				"exponent",
				"trig"
			],
			paramModes: [
				"audio",
				"scalar",
				"scalar",
				"audio",
				"scalar",
				"scalar"
			],
			emitNames: ["stage", "env"],
			usesInput: false
		},
		{
			id: 410,
			genName: "Adsr",
			variantName: "default",
			className: "Adsr_default_attack_audio_decay_scalar_sustain_scalar_release_audio_exponent_scalar_trig_audio",
			paramNames: [
				"attack",
				"decay",
				"sustain",
				"release",
				"exponent",
				"trig"
			],
			paramModes: [
				"audio",
				"scalar",
				"scalar",
				"audio",
				"scalar",
				"audio"
			],
			emitNames: ["stage", "env"],
			usesInput: false
		},
		{
			id: 411,
			genName: "Adsr",
			variantName: "default",
			className: "Adsr_default_attack_audio_decay_scalar_sustain_scalar_release_audio_exponent_audio_trig_scalar",
			paramNames: [
				"attack",
				"decay",
				"sustain",
				"release",
				"exponent",
				"trig"
			],
			paramModes: [
				"audio",
				"scalar",
				"scalar",
				"audio",
				"audio",
				"scalar"
			],
			emitNames: ["stage", "env"],
			usesInput: false
		},
		{
			id: 412,
			genName: "Adsr",
			variantName: "default",
			className: "Adsr_default_attack_audio_decay_scalar_sustain_scalar_release_audio_exponent_audio_trig_audio",
			paramNames: [
				"attack",
				"decay",
				"sustain",
				"release",
				"exponent",
				"trig"
			],
			paramModes: [
				"audio",
				"scalar",
				"scalar",
				"audio",
				"audio",
				"audio"
			],
			emitNames: ["stage", "env"],
			usesInput: false
		},
		{
			id: 413,
			genName: "Adsr",
			variantName: "default",
			className: "Adsr_default_attack_audio_decay_scalar_sustain_audio_release_scalar_exponent_scalar_trig_scalar",
			paramNames: [
				"attack",
				"decay",
				"sustain",
				"release",
				"exponent",
				"trig"
			],
			paramModes: [
				"audio",
				"scalar",
				"audio",
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: ["stage", "env"],
			usesInput: false
		},
		{
			id: 414,
			genName: "Adsr",
			variantName: "default",
			className: "Adsr_default_attack_audio_decay_scalar_sustain_audio_release_scalar_exponent_scalar_trig_audio",
			paramNames: [
				"attack",
				"decay",
				"sustain",
				"release",
				"exponent",
				"trig"
			],
			paramModes: [
				"audio",
				"scalar",
				"audio",
				"scalar",
				"scalar",
				"audio"
			],
			emitNames: ["stage", "env"],
			usesInput: false
		},
		{
			id: 415,
			genName: "Adsr",
			variantName: "default",
			className: "Adsr_default_attack_audio_decay_scalar_sustain_audio_release_scalar_exponent_audio_trig_scalar",
			paramNames: [
				"attack",
				"decay",
				"sustain",
				"release",
				"exponent",
				"trig"
			],
			paramModes: [
				"audio",
				"scalar",
				"audio",
				"scalar",
				"audio",
				"scalar"
			],
			emitNames: ["stage", "env"],
			usesInput: false
		},
		{
			id: 416,
			genName: "Adsr",
			variantName: "default",
			className: "Adsr_default_attack_audio_decay_scalar_sustain_audio_release_scalar_exponent_audio_trig_audio",
			paramNames: [
				"attack",
				"decay",
				"sustain",
				"release",
				"exponent",
				"trig"
			],
			paramModes: [
				"audio",
				"scalar",
				"audio",
				"scalar",
				"audio",
				"audio"
			],
			emitNames: ["stage", "env"],
			usesInput: false
		},
		{
			id: 417,
			genName: "Adsr",
			variantName: "default",
			className: "Adsr_default_attack_audio_decay_scalar_sustain_audio_release_audio_exponent_scalar_trig_scalar",
			paramNames: [
				"attack",
				"decay",
				"sustain",
				"release",
				"exponent",
				"trig"
			],
			paramModes: [
				"audio",
				"scalar",
				"audio",
				"audio",
				"scalar",
				"scalar"
			],
			emitNames: ["stage", "env"],
			usesInput: false
		},
		{
			id: 418,
			genName: "Adsr",
			variantName: "default",
			className: "Adsr_default_attack_audio_decay_scalar_sustain_audio_release_audio_exponent_scalar_trig_audio",
			paramNames: [
				"attack",
				"decay",
				"sustain",
				"release",
				"exponent",
				"trig"
			],
			paramModes: [
				"audio",
				"scalar",
				"audio",
				"audio",
				"scalar",
				"audio"
			],
			emitNames: ["stage", "env"],
			usesInput: false
		},
		{
			id: 419,
			genName: "Adsr",
			variantName: "default",
			className: "Adsr_default_attack_audio_decay_scalar_sustain_audio_release_audio_exponent_audio_trig_scalar",
			paramNames: [
				"attack",
				"decay",
				"sustain",
				"release",
				"exponent",
				"trig"
			],
			paramModes: [
				"audio",
				"scalar",
				"audio",
				"audio",
				"audio",
				"scalar"
			],
			emitNames: ["stage", "env"],
			usesInput: false
		},
		{
			id: 420,
			genName: "Adsr",
			variantName: "default",
			className: "Adsr_default_attack_audio_decay_scalar_sustain_audio_release_audio_exponent_audio_trig_audio",
			paramNames: [
				"attack",
				"decay",
				"sustain",
				"release",
				"exponent",
				"trig"
			],
			paramModes: [
				"audio",
				"scalar",
				"audio",
				"audio",
				"audio",
				"audio"
			],
			emitNames: ["stage", "env"],
			usesInput: false
		},
		{
			id: 421,
			genName: "Adsr",
			variantName: "default",
			className: "Adsr_default_attack_audio_decay_audio_sustain_scalar_release_scalar_exponent_scalar_trig_scalar",
			paramNames: [
				"attack",
				"decay",
				"sustain",
				"release",
				"exponent",
				"trig"
			],
			paramModes: [
				"audio",
				"audio",
				"scalar",
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: ["stage", "env"],
			usesInput: false
		},
		{
			id: 422,
			genName: "Adsr",
			variantName: "default",
			className: "Adsr_default_attack_audio_decay_audio_sustain_scalar_release_scalar_exponent_scalar_trig_audio",
			paramNames: [
				"attack",
				"decay",
				"sustain",
				"release",
				"exponent",
				"trig"
			],
			paramModes: [
				"audio",
				"audio",
				"scalar",
				"scalar",
				"scalar",
				"audio"
			],
			emitNames: ["stage", "env"],
			usesInput: false
		},
		{
			id: 423,
			genName: "Adsr",
			variantName: "default",
			className: "Adsr_default_attack_audio_decay_audio_sustain_scalar_release_scalar_exponent_audio_trig_scalar",
			paramNames: [
				"attack",
				"decay",
				"sustain",
				"release",
				"exponent",
				"trig"
			],
			paramModes: [
				"audio",
				"audio",
				"scalar",
				"scalar",
				"audio",
				"scalar"
			],
			emitNames: ["stage", "env"],
			usesInput: false
		},
		{
			id: 424,
			genName: "Adsr",
			variantName: "default",
			className: "Adsr_default_attack_audio_decay_audio_sustain_scalar_release_scalar_exponent_audio_trig_audio",
			paramNames: [
				"attack",
				"decay",
				"sustain",
				"release",
				"exponent",
				"trig"
			],
			paramModes: [
				"audio",
				"audio",
				"scalar",
				"scalar",
				"audio",
				"audio"
			],
			emitNames: ["stage", "env"],
			usesInput: false
		},
		{
			id: 425,
			genName: "Adsr",
			variantName: "default",
			className: "Adsr_default_attack_audio_decay_audio_sustain_scalar_release_audio_exponent_scalar_trig_scalar",
			paramNames: [
				"attack",
				"decay",
				"sustain",
				"release",
				"exponent",
				"trig"
			],
			paramModes: [
				"audio",
				"audio",
				"scalar",
				"audio",
				"scalar",
				"scalar"
			],
			emitNames: ["stage", "env"],
			usesInput: false
		},
		{
			id: 426,
			genName: "Adsr",
			variantName: "default",
			className: "Adsr_default_attack_audio_decay_audio_sustain_scalar_release_audio_exponent_scalar_trig_audio",
			paramNames: [
				"attack",
				"decay",
				"sustain",
				"release",
				"exponent",
				"trig"
			],
			paramModes: [
				"audio",
				"audio",
				"scalar",
				"audio",
				"scalar",
				"audio"
			],
			emitNames: ["stage", "env"],
			usesInput: false
		},
		{
			id: 427,
			genName: "Adsr",
			variantName: "default",
			className: "Adsr_default_attack_audio_decay_audio_sustain_scalar_release_audio_exponent_audio_trig_scalar",
			paramNames: [
				"attack",
				"decay",
				"sustain",
				"release",
				"exponent",
				"trig"
			],
			paramModes: [
				"audio",
				"audio",
				"scalar",
				"audio",
				"audio",
				"scalar"
			],
			emitNames: ["stage", "env"],
			usesInput: false
		},
		{
			id: 428,
			genName: "Adsr",
			variantName: "default",
			className: "Adsr_default_attack_audio_decay_audio_sustain_scalar_release_audio_exponent_audio_trig_audio",
			paramNames: [
				"attack",
				"decay",
				"sustain",
				"release",
				"exponent",
				"trig"
			],
			paramModes: [
				"audio",
				"audio",
				"scalar",
				"audio",
				"audio",
				"audio"
			],
			emitNames: ["stage", "env"],
			usesInput: false
		},
		{
			id: 429,
			genName: "Adsr",
			variantName: "default",
			className: "Adsr_default_attack_audio_decay_audio_sustain_audio_release_scalar_exponent_scalar_trig_scalar",
			paramNames: [
				"attack",
				"decay",
				"sustain",
				"release",
				"exponent",
				"trig"
			],
			paramModes: [
				"audio",
				"audio",
				"audio",
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: ["stage", "env"],
			usesInput: false
		},
		{
			id: 430,
			genName: "Adsr",
			variantName: "default",
			className: "Adsr_default_attack_audio_decay_audio_sustain_audio_release_scalar_exponent_scalar_trig_audio",
			paramNames: [
				"attack",
				"decay",
				"sustain",
				"release",
				"exponent",
				"trig"
			],
			paramModes: [
				"audio",
				"audio",
				"audio",
				"scalar",
				"scalar",
				"audio"
			],
			emitNames: ["stage", "env"],
			usesInput: false
		},
		{
			id: 431,
			genName: "Adsr",
			variantName: "default",
			className: "Adsr_default_attack_audio_decay_audio_sustain_audio_release_scalar_exponent_audio_trig_scalar",
			paramNames: [
				"attack",
				"decay",
				"sustain",
				"release",
				"exponent",
				"trig"
			],
			paramModes: [
				"audio",
				"audio",
				"audio",
				"scalar",
				"audio",
				"scalar"
			],
			emitNames: ["stage", "env"],
			usesInput: false
		},
		{
			id: 432,
			genName: "Adsr",
			variantName: "default",
			className: "Adsr_default_attack_audio_decay_audio_sustain_audio_release_scalar_exponent_audio_trig_audio",
			paramNames: [
				"attack",
				"decay",
				"sustain",
				"release",
				"exponent",
				"trig"
			],
			paramModes: [
				"audio",
				"audio",
				"audio",
				"scalar",
				"audio",
				"audio"
			],
			emitNames: ["stage", "env"],
			usesInput: false
		},
		{
			id: 433,
			genName: "Adsr",
			variantName: "default",
			className: "Adsr_default_attack_audio_decay_audio_sustain_audio_release_audio_exponent_scalar_trig_scalar",
			paramNames: [
				"attack",
				"decay",
				"sustain",
				"release",
				"exponent",
				"trig"
			],
			paramModes: [
				"audio",
				"audio",
				"audio",
				"audio",
				"scalar",
				"scalar"
			],
			emitNames: ["stage", "env"],
			usesInput: false
		},
		{
			id: 434,
			genName: "Adsr",
			variantName: "default",
			className: "Adsr_default_attack_audio_decay_audio_sustain_audio_release_audio_exponent_scalar_trig_audio",
			paramNames: [
				"attack",
				"decay",
				"sustain",
				"release",
				"exponent",
				"trig"
			],
			paramModes: [
				"audio",
				"audio",
				"audio",
				"audio",
				"scalar",
				"audio"
			],
			emitNames: ["stage", "env"],
			usesInput: false
		},
		{
			id: 435,
			genName: "Adsr",
			variantName: "default",
			className: "Adsr_default_attack_audio_decay_audio_sustain_audio_release_audio_exponent_audio_trig_scalar",
			paramNames: [
				"attack",
				"decay",
				"sustain",
				"release",
				"exponent",
				"trig"
			],
			paramModes: [
				"audio",
				"audio",
				"audio",
				"audio",
				"audio",
				"scalar"
			],
			emitNames: ["stage", "env"],
			usesInput: false
		},
		{
			id: 436,
			genName: "Adsr",
			variantName: "default",
			className: "Adsr_default_attack_audio_decay_audio_sustain_audio_release_audio_exponent_audio_trig_audio",
			paramNames: [
				"attack",
				"decay",
				"sustain",
				"release",
				"exponent",
				"trig"
			],
			paramModes: [
				"audio",
				"audio",
				"audio",
				"audio",
				"audio",
				"audio"
			],
			emitNames: ["stage", "env"],
			usesInput: false
		},
		{
			id: 437,
			genName: "Analyser",
			variantName: "default",
			className: "Analyser_default_",
			paramNames: [],
			paramModes: [],
			emitNames: [],
			usesInput: true
		},
		{
			id: 438,
			genName: "Biquad",
			variantName: "lp",
			className: "Biquad_lp_cutoff_scalar_q_scalar",
			paramNames: ["cutoff", "q"],
			paramModes: ["scalar", "scalar"],
			emitNames: [],
			usesInput: true
		},
		{
			id: 439,
			genName: "Biquad",
			variantName: "lp",
			className: "Biquad_lp_cutoff_scalar_q_audio",
			paramNames: ["cutoff", "q"],
			paramModes: ["scalar", "audio"],
			emitNames: [],
			usesInput: true
		},
		{
			id: 440,
			genName: "Biquad",
			variantName: "lp",
			className: "Biquad_lp_cutoff_audio_q_scalar",
			paramNames: ["cutoff", "q"],
			paramModes: ["audio", "scalar"],
			emitNames: [],
			usesInput: true
		},
		{
			id: 441,
			genName: "Biquad",
			variantName: "lp",
			className: "Biquad_lp_cutoff_audio_q_audio",
			paramNames: ["cutoff", "q"],
			paramModes: ["audio", "audio"],
			emitNames: [],
			usesInput: true
		},
		{
			id: 442,
			genName: "Biquad",
			variantName: "hp",
			className: "Biquad_hp_cutoff_scalar_q_scalar",
			paramNames: ["cutoff", "q"],
			paramModes: ["scalar", "scalar"],
			emitNames: [],
			usesInput: true
		},
		{
			id: 443,
			genName: "Biquad",
			variantName: "hp",
			className: "Biquad_hp_cutoff_scalar_q_audio",
			paramNames: ["cutoff", "q"],
			paramModes: ["scalar", "audio"],
			emitNames: [],
			usesInput: true
		},
		{
			id: 444,
			genName: "Biquad",
			variantName: "hp",
			className: "Biquad_hp_cutoff_audio_q_scalar",
			paramNames: ["cutoff", "q"],
			paramModes: ["audio", "scalar"],
			emitNames: [],
			usesInput: true
		},
		{
			id: 445,
			genName: "Biquad",
			variantName: "hp",
			className: "Biquad_hp_cutoff_audio_q_audio",
			paramNames: ["cutoff", "q"],
			paramModes: ["audio", "audio"],
			emitNames: [],
			usesInput: true
		},
		{
			id: 446,
			genName: "Biquad",
			variantName: "bp",
			className: "Biquad_bp_cutoff_scalar_q_scalar",
			paramNames: ["cutoff", "q"],
			paramModes: ["scalar", "scalar"],
			emitNames: [],
			usesInput: true
		},
		{
			id: 447,
			genName: "Biquad",
			variantName: "bp",
			className: "Biquad_bp_cutoff_scalar_q_audio",
			paramNames: ["cutoff", "q"],
			paramModes: ["scalar", "audio"],
			emitNames: [],
			usesInput: true
		},
		{
			id: 448,
			genName: "Biquad",
			variantName: "bp",
			className: "Biquad_bp_cutoff_audio_q_scalar",
			paramNames: ["cutoff", "q"],
			paramModes: ["audio", "scalar"],
			emitNames: [],
			usesInput: true
		},
		{
			id: 449,
			genName: "Biquad",
			variantName: "bp",
			className: "Biquad_bp_cutoff_audio_q_audio",
			paramNames: ["cutoff", "q"],
			paramModes: ["audio", "audio"],
			emitNames: [],
			usesInput: true
		},
		{
			id: 450,
			genName: "Biquad",
			variantName: "bs",
			className: "Biquad_bs_cutoff_scalar_q_scalar",
			paramNames: ["cutoff", "q"],
			paramModes: ["scalar", "scalar"],
			emitNames: [],
			usesInput: true
		},
		{
			id: 451,
			genName: "Biquad",
			variantName: "bs",
			className: "Biquad_bs_cutoff_scalar_q_audio",
			paramNames: ["cutoff", "q"],
			paramModes: ["scalar", "audio"],
			emitNames: [],
			usesInput: true
		},
		{
			id: 452,
			genName: "Biquad",
			variantName: "bs",
			className: "Biquad_bs_cutoff_audio_q_scalar",
			paramNames: ["cutoff", "q"],
			paramModes: ["audio", "scalar"],
			emitNames: [],
			usesInput: true
		},
		{
			id: 453,
			genName: "Biquad",
			variantName: "bs",
			className: "Biquad_bs_cutoff_audio_q_audio",
			paramNames: ["cutoff", "q"],
			paramModes: ["audio", "audio"],
			emitNames: [],
			usesInput: true
		},
		{
			id: 454,
			genName: "Biquad",
			variantName: "ap",
			className: "Biquad_ap_cutoff_scalar_q_scalar",
			paramNames: ["cutoff", "q"],
			paramModes: ["scalar", "scalar"],
			emitNames: [],
			usesInput: true
		},
		{
			id: 455,
			genName: "Biquad",
			variantName: "ap",
			className: "Biquad_ap_cutoff_scalar_q_audio",
			paramNames: ["cutoff", "q"],
			paramModes: ["scalar", "audio"],
			emitNames: [],
			usesInput: true
		},
		{
			id: 456,
			genName: "Biquad",
			variantName: "ap",
			className: "Biquad_ap_cutoff_audio_q_scalar",
			paramNames: ["cutoff", "q"],
			paramModes: ["audio", "scalar"],
			emitNames: [],
			usesInput: true
		},
		{
			id: 457,
			genName: "Biquad",
			variantName: "ap",
			className: "Biquad_ap_cutoff_audio_q_audio",
			paramNames: ["cutoff", "q"],
			paramModes: ["audio", "audio"],
			emitNames: [],
			usesInput: true
		},
		{
			id: 458,
			genName: "Envfollow",
			variantName: "default",
			className: "Envfollow_default_attack_scalar_release_scalar",
			paramNames: ["attack", "release"],
			paramModes: ["scalar", "scalar"],
			emitNames: [],
			usesInput: true
		},
		{
			id: 459,
			genName: "Envfollow",
			variantName: "default",
			className: "Envfollow_default_attack_scalar_release_audio",
			paramNames: ["attack", "release"],
			paramModes: ["scalar", "audio"],
			emitNames: [],
			usesInput: true
		},
		{
			id: 460,
			genName: "Envfollow",
			variantName: "default",
			className: "Envfollow_default_attack_audio_release_scalar",
			paramNames: ["attack", "release"],
			paramModes: ["audio", "scalar"],
			emitNames: [],
			usesInput: true
		},
		{
			id: 461,
			genName: "Envfollow",
			variantName: "default",
			className: "Envfollow_default_attack_audio_release_audio",
			paramNames: ["attack", "release"],
			paramModes: ["audio", "audio"],
			emitNames: [],
			usesInput: true
		},
		{
			id: 462,
			genName: "Sah",
			variantName: "default",
			className: "Sah_default_trig_scalar",
			paramNames: ["trig"],
			paramModes: ["scalar"],
			emitNames: [],
			usesInput: true
		},
		{
			id: 463,
			genName: "Sah",
			variantName: "default",
			className: "Sah_default_trig_audio",
			paramNames: ["trig"],
			paramModes: ["audio"],
			emitNames: [],
			usesInput: true
		},
		{
			id: 464,
			genName: "Velvet",
			variantName: "default",
			className: "Velvet_default_room_scalar_damping_scalar_decay_scalar",
			paramNames: [
				"room",
				"damping",
				"decay"
			],
			paramModes: [
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 465,
			genName: "Velvet",
			variantName: "default",
			className: "Velvet_default_room_scalar_damping_scalar_decay_audio",
			paramNames: [
				"room",
				"damping",
				"decay"
			],
			paramModes: [
				"scalar",
				"scalar",
				"audio"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 466,
			genName: "Velvet",
			variantName: "default",
			className: "Velvet_default_room_scalar_damping_audio_decay_scalar",
			paramNames: [
				"room",
				"damping",
				"decay"
			],
			paramModes: [
				"scalar",
				"audio",
				"scalar"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 467,
			genName: "Velvet",
			variantName: "default",
			className: "Velvet_default_room_scalar_damping_audio_decay_audio",
			paramNames: [
				"room",
				"damping",
				"decay"
			],
			paramModes: [
				"scalar",
				"audio",
				"audio"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 468,
			genName: "Velvet",
			variantName: "default",
			className: "Velvet_default_room_audio_damping_scalar_decay_scalar",
			paramNames: [
				"room",
				"damping",
				"decay"
			],
			paramModes: [
				"audio",
				"scalar",
				"scalar"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 469,
			genName: "Velvet",
			variantName: "default",
			className: "Velvet_default_room_audio_damping_scalar_decay_audio",
			paramNames: [
				"room",
				"damping",
				"decay"
			],
			paramModes: [
				"audio",
				"scalar",
				"audio"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 470,
			genName: "Velvet",
			variantName: "default",
			className: "Velvet_default_room_audio_damping_audio_decay_scalar",
			paramNames: [
				"room",
				"damping",
				"decay"
			],
			paramModes: [
				"audio",
				"audio",
				"scalar"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 471,
			genName: "Velvet",
			variantName: "default",
			className: "Velvet_default_room_audio_damping_audio_decay_audio",
			paramNames: [
				"room",
				"damping",
				"decay"
			],
			paramModes: [
				"audio",
				"audio",
				"audio"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 472,
			genName: "Velvet",
			variantName: "default",
			className: "Velvet_default_room_scalar_damping_scalar_decay_scalar_stereo",
			paramNames: [
				"room",
				"damping",
				"decay"
			],
			paramModes: [
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 473,
			genName: "Velvet",
			variantName: "default",
			className: "Velvet_default_room_scalar_damping_scalar_decay_audio_stereo",
			paramNames: [
				"room",
				"damping",
				"decay"
			],
			paramModes: [
				"scalar",
				"scalar",
				"audio"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 474,
			genName: "Velvet",
			variantName: "default",
			className: "Velvet_default_room_scalar_damping_audio_decay_scalar_stereo",
			paramNames: [
				"room",
				"damping",
				"decay"
			],
			paramModes: [
				"scalar",
				"audio",
				"scalar"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 475,
			genName: "Velvet",
			variantName: "default",
			className: "Velvet_default_room_scalar_damping_audio_decay_audio_stereo",
			paramNames: [
				"room",
				"damping",
				"decay"
			],
			paramModes: [
				"scalar",
				"audio",
				"audio"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 476,
			genName: "Velvet",
			variantName: "default",
			className: "Velvet_default_room_audio_damping_scalar_decay_scalar_stereo",
			paramNames: [
				"room",
				"damping",
				"decay"
			],
			paramModes: [
				"audio",
				"scalar",
				"scalar"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 477,
			genName: "Velvet",
			variantName: "default",
			className: "Velvet_default_room_audio_damping_scalar_decay_audio_stereo",
			paramNames: [
				"room",
				"damping",
				"decay"
			],
			paramModes: [
				"audio",
				"scalar",
				"audio"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 478,
			genName: "Velvet",
			variantName: "default",
			className: "Velvet_default_room_audio_damping_audio_decay_scalar_stereo",
			paramNames: [
				"room",
				"damping",
				"decay"
			],
			paramModes: [
				"audio",
				"audio",
				"scalar"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 479,
			genName: "Velvet",
			variantName: "default",
			className: "Velvet_default_room_audio_damping_audio_decay_audio_stereo",
			paramNames: [
				"room",
				"damping",
				"decay"
			],
			paramModes: [
				"audio",
				"audio",
				"audio"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 480,
			genName: "Fdn",
			variantName: "default",
			className: "Fdn_default_room_scalar_damping_scalar_decay_scalar_depth_scalar",
			paramNames: [
				"room",
				"damping",
				"decay",
				"depth"
			],
			paramModes: [
				"scalar",
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 481,
			genName: "Fdn",
			variantName: "default",
			className: "Fdn_default_room_scalar_damping_scalar_decay_scalar_depth_audio",
			paramNames: [
				"room",
				"damping",
				"decay",
				"depth"
			],
			paramModes: [
				"scalar",
				"scalar",
				"scalar",
				"audio"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 482,
			genName: "Fdn",
			variantName: "default",
			className: "Fdn_default_room_scalar_damping_scalar_decay_audio_depth_scalar",
			paramNames: [
				"room",
				"damping",
				"decay",
				"depth"
			],
			paramModes: [
				"scalar",
				"scalar",
				"audio",
				"scalar"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 483,
			genName: "Fdn",
			variantName: "default",
			className: "Fdn_default_room_scalar_damping_scalar_decay_audio_depth_audio",
			paramNames: [
				"room",
				"damping",
				"decay",
				"depth"
			],
			paramModes: [
				"scalar",
				"scalar",
				"audio",
				"audio"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 484,
			genName: "Fdn",
			variantName: "default",
			className: "Fdn_default_room_scalar_damping_audio_decay_scalar_depth_scalar",
			paramNames: [
				"room",
				"damping",
				"decay",
				"depth"
			],
			paramModes: [
				"scalar",
				"audio",
				"scalar",
				"scalar"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 485,
			genName: "Fdn",
			variantName: "default",
			className: "Fdn_default_room_scalar_damping_audio_decay_scalar_depth_audio",
			paramNames: [
				"room",
				"damping",
				"decay",
				"depth"
			],
			paramModes: [
				"scalar",
				"audio",
				"scalar",
				"audio"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 486,
			genName: "Fdn",
			variantName: "default",
			className: "Fdn_default_room_scalar_damping_audio_decay_audio_depth_scalar",
			paramNames: [
				"room",
				"damping",
				"decay",
				"depth"
			],
			paramModes: [
				"scalar",
				"audio",
				"audio",
				"scalar"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 487,
			genName: "Fdn",
			variantName: "default",
			className: "Fdn_default_room_scalar_damping_audio_decay_audio_depth_audio",
			paramNames: [
				"room",
				"damping",
				"decay",
				"depth"
			],
			paramModes: [
				"scalar",
				"audio",
				"audio",
				"audio"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 488,
			genName: "Fdn",
			variantName: "default",
			className: "Fdn_default_room_audio_damping_scalar_decay_scalar_depth_scalar",
			paramNames: [
				"room",
				"damping",
				"decay",
				"depth"
			],
			paramModes: [
				"audio",
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 489,
			genName: "Fdn",
			variantName: "default",
			className: "Fdn_default_room_audio_damping_scalar_decay_scalar_depth_audio",
			paramNames: [
				"room",
				"damping",
				"decay",
				"depth"
			],
			paramModes: [
				"audio",
				"scalar",
				"scalar",
				"audio"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 490,
			genName: "Fdn",
			variantName: "default",
			className: "Fdn_default_room_audio_damping_scalar_decay_audio_depth_scalar",
			paramNames: [
				"room",
				"damping",
				"decay",
				"depth"
			],
			paramModes: [
				"audio",
				"scalar",
				"audio",
				"scalar"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 491,
			genName: "Fdn",
			variantName: "default",
			className: "Fdn_default_room_audio_damping_scalar_decay_audio_depth_audio",
			paramNames: [
				"room",
				"damping",
				"decay",
				"depth"
			],
			paramModes: [
				"audio",
				"scalar",
				"audio",
				"audio"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 492,
			genName: "Fdn",
			variantName: "default",
			className: "Fdn_default_room_audio_damping_audio_decay_scalar_depth_scalar",
			paramNames: [
				"room",
				"damping",
				"decay",
				"depth"
			],
			paramModes: [
				"audio",
				"audio",
				"scalar",
				"scalar"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 493,
			genName: "Fdn",
			variantName: "default",
			className: "Fdn_default_room_audio_damping_audio_decay_scalar_depth_audio",
			paramNames: [
				"room",
				"damping",
				"decay",
				"depth"
			],
			paramModes: [
				"audio",
				"audio",
				"scalar",
				"audio"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 494,
			genName: "Fdn",
			variantName: "default",
			className: "Fdn_default_room_audio_damping_audio_decay_audio_depth_scalar",
			paramNames: [
				"room",
				"damping",
				"decay",
				"depth"
			],
			paramModes: [
				"audio",
				"audio",
				"audio",
				"scalar"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 495,
			genName: "Fdn",
			variantName: "default",
			className: "Fdn_default_room_audio_damping_audio_decay_audio_depth_audio",
			paramNames: [
				"room",
				"damping",
				"decay",
				"depth"
			],
			paramModes: [
				"audio",
				"audio",
				"audio",
				"audio"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 496,
			genName: "Fdn",
			variantName: "default",
			className: "Fdn_default_room_scalar_damping_scalar_decay_scalar_depth_scalar_stereo",
			paramNames: [
				"room",
				"damping",
				"decay",
				"depth"
			],
			paramModes: [
				"scalar",
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 497,
			genName: "Fdn",
			variantName: "default",
			className: "Fdn_default_room_scalar_damping_scalar_decay_scalar_depth_audio_stereo",
			paramNames: [
				"room",
				"damping",
				"decay",
				"depth"
			],
			paramModes: [
				"scalar",
				"scalar",
				"scalar",
				"audio"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 498,
			genName: "Fdn",
			variantName: "default",
			className: "Fdn_default_room_scalar_damping_scalar_decay_audio_depth_scalar_stereo",
			paramNames: [
				"room",
				"damping",
				"decay",
				"depth"
			],
			paramModes: [
				"scalar",
				"scalar",
				"audio",
				"scalar"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 499,
			genName: "Fdn",
			variantName: "default",
			className: "Fdn_default_room_scalar_damping_scalar_decay_audio_depth_audio_stereo",
			paramNames: [
				"room",
				"damping",
				"decay",
				"depth"
			],
			paramModes: [
				"scalar",
				"scalar",
				"audio",
				"audio"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 500,
			genName: "Fdn",
			variantName: "default",
			className: "Fdn_default_room_scalar_damping_audio_decay_scalar_depth_scalar_stereo",
			paramNames: [
				"room",
				"damping",
				"decay",
				"depth"
			],
			paramModes: [
				"scalar",
				"audio",
				"scalar",
				"scalar"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 501,
			genName: "Fdn",
			variantName: "default",
			className: "Fdn_default_room_scalar_damping_audio_decay_scalar_depth_audio_stereo",
			paramNames: [
				"room",
				"damping",
				"decay",
				"depth"
			],
			paramModes: [
				"scalar",
				"audio",
				"scalar",
				"audio"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 502,
			genName: "Fdn",
			variantName: "default",
			className: "Fdn_default_room_scalar_damping_audio_decay_audio_depth_scalar_stereo",
			paramNames: [
				"room",
				"damping",
				"decay",
				"depth"
			],
			paramModes: [
				"scalar",
				"audio",
				"audio",
				"scalar"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 503,
			genName: "Fdn",
			variantName: "default",
			className: "Fdn_default_room_scalar_damping_audio_decay_audio_depth_audio_stereo",
			paramNames: [
				"room",
				"damping",
				"decay",
				"depth"
			],
			paramModes: [
				"scalar",
				"audio",
				"audio",
				"audio"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 504,
			genName: "Fdn",
			variantName: "default",
			className: "Fdn_default_room_audio_damping_scalar_decay_scalar_depth_scalar_stereo",
			paramNames: [
				"room",
				"damping",
				"decay",
				"depth"
			],
			paramModes: [
				"audio",
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 505,
			genName: "Fdn",
			variantName: "default",
			className: "Fdn_default_room_audio_damping_scalar_decay_scalar_depth_audio_stereo",
			paramNames: [
				"room",
				"damping",
				"decay",
				"depth"
			],
			paramModes: [
				"audio",
				"scalar",
				"scalar",
				"audio"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 506,
			genName: "Fdn",
			variantName: "default",
			className: "Fdn_default_room_audio_damping_scalar_decay_audio_depth_scalar_stereo",
			paramNames: [
				"room",
				"damping",
				"decay",
				"depth"
			],
			paramModes: [
				"audio",
				"scalar",
				"audio",
				"scalar"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 507,
			genName: "Fdn",
			variantName: "default",
			className: "Fdn_default_room_audio_damping_scalar_decay_audio_depth_audio_stereo",
			paramNames: [
				"room",
				"damping",
				"decay",
				"depth"
			],
			paramModes: [
				"audio",
				"scalar",
				"audio",
				"audio"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 508,
			genName: "Fdn",
			variantName: "default",
			className: "Fdn_default_room_audio_damping_audio_decay_scalar_depth_scalar_stereo",
			paramNames: [
				"room",
				"damping",
				"decay",
				"depth"
			],
			paramModes: [
				"audio",
				"audio",
				"scalar",
				"scalar"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 509,
			genName: "Fdn",
			variantName: "default",
			className: "Fdn_default_room_audio_damping_audio_decay_scalar_depth_audio_stereo",
			paramNames: [
				"room",
				"damping",
				"decay",
				"depth"
			],
			paramModes: [
				"audio",
				"audio",
				"scalar",
				"audio"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 510,
			genName: "Fdn",
			variantName: "default",
			className: "Fdn_default_room_audio_damping_audio_decay_audio_depth_scalar_stereo",
			paramNames: [
				"room",
				"damping",
				"decay",
				"depth"
			],
			paramModes: [
				"audio",
				"audio",
				"audio",
				"scalar"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 511,
			genName: "Fdn",
			variantName: "default",
			className: "Fdn_default_room_audio_damping_audio_decay_audio_depth_audio_stereo",
			paramNames: [
				"room",
				"damping",
				"decay",
				"depth"
			],
			paramModes: [
				"audio",
				"audio",
				"audio",
				"audio"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 512,
			genName: "Pink",
			variantName: "default",
			className: "Pink_default_seed_scalar_trig_scalar",
			paramNames: ["seed", "trig"],
			paramModes: ["scalar", "scalar"],
			emitNames: [],
			usesInput: false
		},
		{
			id: 513,
			genName: "Pink",
			variantName: "default",
			className: "Pink_default_seed_scalar_trig_audio",
			paramNames: ["seed", "trig"],
			paramModes: ["scalar", "audio"],
			emitNames: [],
			usesInput: false
		},
		{
			id: 514,
			genName: "Dattorro",
			variantName: "default",
			className: "Dattorro_default_room_scalar_damping_scalar_bandwidth_scalar_indiff1_scalar_indiff2_scalar_decdiff1_scalar_decdiff2_scalar_excrate_scalar_excdepth_scalar_predelay_scalar",
			paramNames: [
				"room",
				"damping",
				"bandwidth",
				"indiff1",
				"indiff2",
				"decdiff1",
				"decdiff2",
				"excrate",
				"excdepth",
				"predelay"
			],
			paramModes: [
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 515,
			genName: "Dattorro",
			variantName: "default",
			className: "Dattorro_default_room_scalar_damping_scalar_bandwidth_audio_indiff1_scalar_indiff2_scalar_decdiff1_scalar_decdiff2_scalar_excrate_scalar_excdepth_scalar_predelay_scalar",
			paramNames: [
				"room",
				"damping",
				"bandwidth",
				"indiff1",
				"indiff2",
				"decdiff1",
				"decdiff2",
				"excrate",
				"excdepth",
				"predelay"
			],
			paramModes: [
				"scalar",
				"scalar",
				"audio",
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 516,
			genName: "Dattorro",
			variantName: "default",
			className: "Dattorro_default_room_scalar_damping_audio_bandwidth_scalar_indiff1_scalar_indiff2_scalar_decdiff1_scalar_decdiff2_scalar_excrate_scalar_excdepth_scalar_predelay_scalar",
			paramNames: [
				"room",
				"damping",
				"bandwidth",
				"indiff1",
				"indiff2",
				"decdiff1",
				"decdiff2",
				"excrate",
				"excdepth",
				"predelay"
			],
			paramModes: [
				"scalar",
				"audio",
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 517,
			genName: "Dattorro",
			variantName: "default",
			className: "Dattorro_default_room_scalar_damping_audio_bandwidth_audio_indiff1_scalar_indiff2_scalar_decdiff1_scalar_decdiff2_scalar_excrate_scalar_excdepth_scalar_predelay_scalar",
			paramNames: [
				"room",
				"damping",
				"bandwidth",
				"indiff1",
				"indiff2",
				"decdiff1",
				"decdiff2",
				"excrate",
				"excdepth",
				"predelay"
			],
			paramModes: [
				"scalar",
				"audio",
				"audio",
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 518,
			genName: "Dattorro",
			variantName: "default",
			className: "Dattorro_default_room_audio_damping_scalar_bandwidth_scalar_indiff1_scalar_indiff2_scalar_decdiff1_scalar_decdiff2_scalar_excrate_scalar_excdepth_scalar_predelay_scalar",
			paramNames: [
				"room",
				"damping",
				"bandwidth",
				"indiff1",
				"indiff2",
				"decdiff1",
				"decdiff2",
				"excrate",
				"excdepth",
				"predelay"
			],
			paramModes: [
				"audio",
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 519,
			genName: "Dattorro",
			variantName: "default",
			className: "Dattorro_default_room_audio_damping_scalar_bandwidth_audio_indiff1_scalar_indiff2_scalar_decdiff1_scalar_decdiff2_scalar_excrate_scalar_excdepth_scalar_predelay_scalar",
			paramNames: [
				"room",
				"damping",
				"bandwidth",
				"indiff1",
				"indiff2",
				"decdiff1",
				"decdiff2",
				"excrate",
				"excdepth",
				"predelay"
			],
			paramModes: [
				"audio",
				"scalar",
				"audio",
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 520,
			genName: "Dattorro",
			variantName: "default",
			className: "Dattorro_default_room_audio_damping_audio_bandwidth_scalar_indiff1_scalar_indiff2_scalar_decdiff1_scalar_decdiff2_scalar_excrate_scalar_excdepth_scalar_predelay_scalar",
			paramNames: [
				"room",
				"damping",
				"bandwidth",
				"indiff1",
				"indiff2",
				"decdiff1",
				"decdiff2",
				"excrate",
				"excdepth",
				"predelay"
			],
			paramModes: [
				"audio",
				"audio",
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 521,
			genName: "Dattorro",
			variantName: "default",
			className: "Dattorro_default_room_audio_damping_audio_bandwidth_audio_indiff1_scalar_indiff2_scalar_decdiff1_scalar_decdiff2_scalar_excrate_scalar_excdepth_scalar_predelay_scalar",
			paramNames: [
				"room",
				"damping",
				"bandwidth",
				"indiff1",
				"indiff2",
				"decdiff1",
				"decdiff2",
				"excrate",
				"excdepth",
				"predelay"
			],
			paramModes: [
				"audio",
				"audio",
				"audio",
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 522,
			genName: "Dattorro",
			variantName: "default",
			className: "Dattorro_default_room_scalar_damping_scalar_bandwidth_scalar_indiff1_scalar_indiff2_scalar_decdiff1_scalar_decdiff2_scalar_excrate_scalar_excdepth_scalar_predelay_scalar_stereo",
			paramNames: [
				"room",
				"damping",
				"bandwidth",
				"indiff1",
				"indiff2",
				"decdiff1",
				"decdiff2",
				"excrate",
				"excdepth",
				"predelay"
			],
			paramModes: [
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 523,
			genName: "Dattorro",
			variantName: "default",
			className: "Dattorro_default_room_scalar_damping_scalar_bandwidth_audio_indiff1_scalar_indiff2_scalar_decdiff1_scalar_decdiff2_scalar_excrate_scalar_excdepth_scalar_predelay_scalar_stereo",
			paramNames: [
				"room",
				"damping",
				"bandwidth",
				"indiff1",
				"indiff2",
				"decdiff1",
				"decdiff2",
				"excrate",
				"excdepth",
				"predelay"
			],
			paramModes: [
				"scalar",
				"scalar",
				"audio",
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 524,
			genName: "Dattorro",
			variantName: "default",
			className: "Dattorro_default_room_scalar_damping_audio_bandwidth_scalar_indiff1_scalar_indiff2_scalar_decdiff1_scalar_decdiff2_scalar_excrate_scalar_excdepth_scalar_predelay_scalar_stereo",
			paramNames: [
				"room",
				"damping",
				"bandwidth",
				"indiff1",
				"indiff2",
				"decdiff1",
				"decdiff2",
				"excrate",
				"excdepth",
				"predelay"
			],
			paramModes: [
				"scalar",
				"audio",
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 525,
			genName: "Dattorro",
			variantName: "default",
			className: "Dattorro_default_room_scalar_damping_audio_bandwidth_audio_indiff1_scalar_indiff2_scalar_decdiff1_scalar_decdiff2_scalar_excrate_scalar_excdepth_scalar_predelay_scalar_stereo",
			paramNames: [
				"room",
				"damping",
				"bandwidth",
				"indiff1",
				"indiff2",
				"decdiff1",
				"decdiff2",
				"excrate",
				"excdepth",
				"predelay"
			],
			paramModes: [
				"scalar",
				"audio",
				"audio",
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 526,
			genName: "Dattorro",
			variantName: "default",
			className: "Dattorro_default_room_audio_damping_scalar_bandwidth_scalar_indiff1_scalar_indiff2_scalar_decdiff1_scalar_decdiff2_scalar_excrate_scalar_excdepth_scalar_predelay_scalar_stereo",
			paramNames: [
				"room",
				"damping",
				"bandwidth",
				"indiff1",
				"indiff2",
				"decdiff1",
				"decdiff2",
				"excrate",
				"excdepth",
				"predelay"
			],
			paramModes: [
				"audio",
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 527,
			genName: "Dattorro",
			variantName: "default",
			className: "Dattorro_default_room_audio_damping_scalar_bandwidth_audio_indiff1_scalar_indiff2_scalar_decdiff1_scalar_decdiff2_scalar_excrate_scalar_excdepth_scalar_predelay_scalar_stereo",
			paramNames: [
				"room",
				"damping",
				"bandwidth",
				"indiff1",
				"indiff2",
				"decdiff1",
				"decdiff2",
				"excrate",
				"excdepth",
				"predelay"
			],
			paramModes: [
				"audio",
				"scalar",
				"audio",
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 528,
			genName: "Dattorro",
			variantName: "default",
			className: "Dattorro_default_room_audio_damping_audio_bandwidth_scalar_indiff1_scalar_indiff2_scalar_decdiff1_scalar_decdiff2_scalar_excrate_scalar_excdepth_scalar_predelay_scalar_stereo",
			paramNames: [
				"room",
				"damping",
				"bandwidth",
				"indiff1",
				"indiff2",
				"decdiff1",
				"decdiff2",
				"excrate",
				"excdepth",
				"predelay"
			],
			paramModes: [
				"audio",
				"audio",
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 529,
			genName: "Dattorro",
			variantName: "default",
			className: "Dattorro_default_room_audio_damping_audio_bandwidth_audio_indiff1_scalar_indiff2_scalar_decdiff1_scalar_decdiff2_scalar_excrate_scalar_excdepth_scalar_predelay_scalar_stereo",
			paramNames: [
				"room",
				"damping",
				"bandwidth",
				"indiff1",
				"indiff2",
				"decdiff1",
				"decdiff2",
				"excrate",
				"excdepth",
				"predelay"
			],
			paramModes: [
				"audio",
				"audio",
				"audio",
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 530,
			genName: "Random",
			variantName: "default",
			className: "Random_default_seed_scalar",
			paramNames: ["seed"],
			paramModes: ["scalar"],
			emitNames: [],
			usesInput: false
		},
		{
			id: 531,
			genName: "Slew",
			variantName: "default",
			className: "Slew_default_up_scalar_down_scalar_exp_scalar",
			paramNames: [
				"up",
				"down",
				"exp"
			],
			paramModes: [
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 532,
			genName: "Slew",
			variantName: "default",
			className: "Slew_default_up_scalar_down_scalar_exp_audio",
			paramNames: [
				"up",
				"down",
				"exp"
			],
			paramModes: [
				"scalar",
				"scalar",
				"audio"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 533,
			genName: "Slew",
			variantName: "default",
			className: "Slew_default_up_scalar_down_audio_exp_scalar",
			paramNames: [
				"up",
				"down",
				"exp"
			],
			paramModes: [
				"scalar",
				"audio",
				"scalar"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 534,
			genName: "Slew",
			variantName: "default",
			className: "Slew_default_up_scalar_down_audio_exp_audio",
			paramNames: [
				"up",
				"down",
				"exp"
			],
			paramModes: [
				"scalar",
				"audio",
				"audio"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 535,
			genName: "Slew",
			variantName: "default",
			className: "Slew_default_up_audio_down_scalar_exp_scalar",
			paramNames: [
				"up",
				"down",
				"exp"
			],
			paramModes: [
				"audio",
				"scalar",
				"scalar"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 536,
			genName: "Slew",
			variantName: "default",
			className: "Slew_default_up_audio_down_scalar_exp_audio",
			paramNames: [
				"up",
				"down",
				"exp"
			],
			paramModes: [
				"audio",
				"scalar",
				"audio"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 537,
			genName: "Slew",
			variantName: "default",
			className: "Slew_default_up_audio_down_audio_exp_scalar",
			paramNames: [
				"up",
				"down",
				"exp"
			],
			paramModes: [
				"audio",
				"audio",
				"scalar"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 538,
			genName: "Slew",
			variantName: "default",
			className: "Slew_default_up_audio_down_audio_exp_audio",
			paramNames: [
				"up",
				"down",
				"exp"
			],
			paramModes: [
				"audio",
				"audio",
				"audio"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 539,
			genName: "Inc",
			variantName: "default",
			className: "Inc_default_hz_scalar_ceil_scalar_offset_scalar_trig_scalar",
			paramNames: [
				"hz",
				"ceil",
				"offset",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 540,
			genName: "Inc",
			variantName: "default",
			className: "Inc_default_hz_scalar_ceil_scalar_offset_scalar_trig_audio",
			paramNames: [
				"hz",
				"ceil",
				"offset",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"scalar",
				"audio"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 541,
			genName: "Inc",
			variantName: "default",
			className: "Inc_default_hz_scalar_ceil_scalar_offset_audio_trig_scalar",
			paramNames: [
				"hz",
				"ceil",
				"offset",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"audio",
				"scalar"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 542,
			genName: "Inc",
			variantName: "default",
			className: "Inc_default_hz_scalar_ceil_scalar_offset_audio_trig_audio",
			paramNames: [
				"hz",
				"ceil",
				"offset",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"audio",
				"audio"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 543,
			genName: "Inc",
			variantName: "default",
			className: "Inc_default_hz_scalar_ceil_audio_offset_scalar_trig_scalar",
			paramNames: [
				"hz",
				"ceil",
				"offset",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"scalar",
				"scalar"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 544,
			genName: "Inc",
			variantName: "default",
			className: "Inc_default_hz_scalar_ceil_audio_offset_scalar_trig_audio",
			paramNames: [
				"hz",
				"ceil",
				"offset",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"scalar",
				"audio"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 545,
			genName: "Inc",
			variantName: "default",
			className: "Inc_default_hz_scalar_ceil_audio_offset_audio_trig_scalar",
			paramNames: [
				"hz",
				"ceil",
				"offset",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"audio",
				"scalar"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 546,
			genName: "Inc",
			variantName: "default",
			className: "Inc_default_hz_scalar_ceil_audio_offset_audio_trig_audio",
			paramNames: [
				"hz",
				"ceil",
				"offset",
				"trig"
			],
			paramModes: [
				"scalar",
				"audio",
				"audio",
				"audio"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 547,
			genName: "Inc",
			variantName: "default",
			className: "Inc_default_hz_audio_ceil_scalar_offset_scalar_trig_scalar",
			paramNames: [
				"hz",
				"ceil",
				"offset",
				"trig"
			],
			paramModes: [
				"audio",
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 548,
			genName: "Inc",
			variantName: "default",
			className: "Inc_default_hz_audio_ceil_scalar_offset_scalar_trig_audio",
			paramNames: [
				"hz",
				"ceil",
				"offset",
				"trig"
			],
			paramModes: [
				"audio",
				"scalar",
				"scalar",
				"audio"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 549,
			genName: "Inc",
			variantName: "default",
			className: "Inc_default_hz_audio_ceil_scalar_offset_audio_trig_scalar",
			paramNames: [
				"hz",
				"ceil",
				"offset",
				"trig"
			],
			paramModes: [
				"audio",
				"scalar",
				"audio",
				"scalar"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 550,
			genName: "Inc",
			variantName: "default",
			className: "Inc_default_hz_audio_ceil_scalar_offset_audio_trig_audio",
			paramNames: [
				"hz",
				"ceil",
				"offset",
				"trig"
			],
			paramModes: [
				"audio",
				"scalar",
				"audio",
				"audio"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 551,
			genName: "Inc",
			variantName: "default",
			className: "Inc_default_hz_audio_ceil_audio_offset_scalar_trig_scalar",
			paramNames: [
				"hz",
				"ceil",
				"offset",
				"trig"
			],
			paramModes: [
				"audio",
				"audio",
				"scalar",
				"scalar"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 552,
			genName: "Inc",
			variantName: "default",
			className: "Inc_default_hz_audio_ceil_audio_offset_scalar_trig_audio",
			paramNames: [
				"hz",
				"ceil",
				"offset",
				"trig"
			],
			paramModes: [
				"audio",
				"audio",
				"scalar",
				"audio"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 553,
			genName: "Inc",
			variantName: "default",
			className: "Inc_default_hz_audio_ceil_audio_offset_audio_trig_scalar",
			paramNames: [
				"hz",
				"ceil",
				"offset",
				"trig"
			],
			paramModes: [
				"audio",
				"audio",
				"audio",
				"scalar"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 554,
			genName: "Inc",
			variantName: "default",
			className: "Inc_default_hz_audio_ceil_audio_offset_audio_trig_audio",
			paramNames: [
				"hz",
				"ceil",
				"offset",
				"trig"
			],
			paramModes: [
				"audio",
				"audio",
				"audio",
				"audio"
			],
			emitNames: ["phase"],
			usesInput: false
		},
		{
			id: 555,
			genName: "Biquadshelf",
			variantName: "ls",
			className: "Biquadshelf_ls_cutoff_scalar_q_scalar_gain_scalar",
			paramNames: [
				"cutoff",
				"q",
				"gain"
			],
			paramModes: [
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 556,
			genName: "Biquadshelf",
			variantName: "ls",
			className: "Biquadshelf_ls_cutoff_scalar_q_scalar_gain_audio",
			paramNames: [
				"cutoff",
				"q",
				"gain"
			],
			paramModes: [
				"scalar",
				"scalar",
				"audio"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 557,
			genName: "Biquadshelf",
			variantName: "ls",
			className: "Biquadshelf_ls_cutoff_scalar_q_audio_gain_scalar",
			paramNames: [
				"cutoff",
				"q",
				"gain"
			],
			paramModes: [
				"scalar",
				"audio",
				"scalar"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 558,
			genName: "Biquadshelf",
			variantName: "ls",
			className: "Biquadshelf_ls_cutoff_scalar_q_audio_gain_audio",
			paramNames: [
				"cutoff",
				"q",
				"gain"
			],
			paramModes: [
				"scalar",
				"audio",
				"audio"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 559,
			genName: "Biquadshelf",
			variantName: "ls",
			className: "Biquadshelf_ls_cutoff_audio_q_scalar_gain_scalar",
			paramNames: [
				"cutoff",
				"q",
				"gain"
			],
			paramModes: [
				"audio",
				"scalar",
				"scalar"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 560,
			genName: "Biquadshelf",
			variantName: "ls",
			className: "Biquadshelf_ls_cutoff_audio_q_scalar_gain_audio",
			paramNames: [
				"cutoff",
				"q",
				"gain"
			],
			paramModes: [
				"audio",
				"scalar",
				"audio"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 561,
			genName: "Biquadshelf",
			variantName: "ls",
			className: "Biquadshelf_ls_cutoff_audio_q_audio_gain_scalar",
			paramNames: [
				"cutoff",
				"q",
				"gain"
			],
			paramModes: [
				"audio",
				"audio",
				"scalar"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 562,
			genName: "Biquadshelf",
			variantName: "ls",
			className: "Biquadshelf_ls_cutoff_audio_q_audio_gain_audio",
			paramNames: [
				"cutoff",
				"q",
				"gain"
			],
			paramModes: [
				"audio",
				"audio",
				"audio"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 563,
			genName: "Biquadshelf",
			variantName: "hs",
			className: "Biquadshelf_hs_cutoff_scalar_q_scalar_gain_scalar",
			paramNames: [
				"cutoff",
				"q",
				"gain"
			],
			paramModes: [
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 564,
			genName: "Biquadshelf",
			variantName: "hs",
			className: "Biquadshelf_hs_cutoff_scalar_q_scalar_gain_audio",
			paramNames: [
				"cutoff",
				"q",
				"gain"
			],
			paramModes: [
				"scalar",
				"scalar",
				"audio"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 565,
			genName: "Biquadshelf",
			variantName: "hs",
			className: "Biquadshelf_hs_cutoff_scalar_q_audio_gain_scalar",
			paramNames: [
				"cutoff",
				"q",
				"gain"
			],
			paramModes: [
				"scalar",
				"audio",
				"scalar"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 566,
			genName: "Biquadshelf",
			variantName: "hs",
			className: "Biquadshelf_hs_cutoff_scalar_q_audio_gain_audio",
			paramNames: [
				"cutoff",
				"q",
				"gain"
			],
			paramModes: [
				"scalar",
				"audio",
				"audio"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 567,
			genName: "Biquadshelf",
			variantName: "hs",
			className: "Biquadshelf_hs_cutoff_audio_q_scalar_gain_scalar",
			paramNames: [
				"cutoff",
				"q",
				"gain"
			],
			paramModes: [
				"audio",
				"scalar",
				"scalar"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 568,
			genName: "Biquadshelf",
			variantName: "hs",
			className: "Biquadshelf_hs_cutoff_audio_q_scalar_gain_audio",
			paramNames: [
				"cutoff",
				"q",
				"gain"
			],
			paramModes: [
				"audio",
				"scalar",
				"audio"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 569,
			genName: "Biquadshelf",
			variantName: "hs",
			className: "Biquadshelf_hs_cutoff_audio_q_audio_gain_scalar",
			paramNames: [
				"cutoff",
				"q",
				"gain"
			],
			paramModes: [
				"audio",
				"audio",
				"scalar"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 570,
			genName: "Biquadshelf",
			variantName: "hs",
			className: "Biquadshelf_hs_cutoff_audio_q_audio_gain_audio",
			paramNames: [
				"cutoff",
				"q",
				"gain"
			],
			paramModes: [
				"audio",
				"audio",
				"audio"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 571,
			genName: "Biquadshelf",
			variantName: "peak",
			className: "Biquadshelf_peak_cutoff_scalar_q_scalar_gain_scalar",
			paramNames: [
				"cutoff",
				"q",
				"gain"
			],
			paramModes: [
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 572,
			genName: "Biquadshelf",
			variantName: "peak",
			className: "Biquadshelf_peak_cutoff_scalar_q_scalar_gain_audio",
			paramNames: [
				"cutoff",
				"q",
				"gain"
			],
			paramModes: [
				"scalar",
				"scalar",
				"audio"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 573,
			genName: "Biquadshelf",
			variantName: "peak",
			className: "Biquadshelf_peak_cutoff_scalar_q_audio_gain_scalar",
			paramNames: [
				"cutoff",
				"q",
				"gain"
			],
			paramModes: [
				"scalar",
				"audio",
				"scalar"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 574,
			genName: "Biquadshelf",
			variantName: "peak",
			className: "Biquadshelf_peak_cutoff_scalar_q_audio_gain_audio",
			paramNames: [
				"cutoff",
				"q",
				"gain"
			],
			paramModes: [
				"scalar",
				"audio",
				"audio"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 575,
			genName: "Biquadshelf",
			variantName: "peak",
			className: "Biquadshelf_peak_cutoff_audio_q_scalar_gain_scalar",
			paramNames: [
				"cutoff",
				"q",
				"gain"
			],
			paramModes: [
				"audio",
				"scalar",
				"scalar"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 576,
			genName: "Biquadshelf",
			variantName: "peak",
			className: "Biquadshelf_peak_cutoff_audio_q_scalar_gain_audio",
			paramNames: [
				"cutoff",
				"q",
				"gain"
			],
			paramModes: [
				"audio",
				"scalar",
				"audio"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 577,
			genName: "Biquadshelf",
			variantName: "peak",
			className: "Biquadshelf_peak_cutoff_audio_q_audio_gain_scalar",
			paramNames: [
				"cutoff",
				"q",
				"gain"
			],
			paramModes: [
				"audio",
				"audio",
				"scalar"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 578,
			genName: "Biquadshelf",
			variantName: "peak",
			className: "Biquadshelf_peak_cutoff_audio_q_audio_gain_audio",
			paramNames: [
				"cutoff",
				"q",
				"gain"
			],
			paramModes: [
				"audio",
				"audio",
				"audio"
			],
			emitNames: [],
			usesInput: true
		},
		{
			id: 579,
			genName: "Sampler",
			variantName: "default",
			className: "Sampler_default_sample_scalar_speed_scalar_offset_scalar_repeat_scalar_trig_scalar",
			paramNames: [
				"sample",
				"speed",
				"offset",
				"repeat",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: ["position", "playing"],
			usesInput: false
		},
		{
			id: 580,
			genName: "Sampler",
			variantName: "default",
			className: "Sampler_default_sample_scalar_speed_scalar_offset_scalar_repeat_scalar_trig_audio",
			paramNames: [
				"sample",
				"speed",
				"offset",
				"repeat",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"audio"
			],
			emitNames: ["position", "playing"],
			usesInput: false
		},
		{
			id: 581,
			genName: "Sampler",
			variantName: "default",
			className: "Sampler_default_sample_scalar_speed_scalar_offset_audio_repeat_scalar_trig_scalar",
			paramNames: [
				"sample",
				"speed",
				"offset",
				"repeat",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"audio",
				"scalar",
				"scalar"
			],
			emitNames: ["position", "playing"],
			usesInput: false
		},
		{
			id: 582,
			genName: "Sampler",
			variantName: "default",
			className: "Sampler_default_sample_scalar_speed_scalar_offset_audio_repeat_scalar_trig_audio",
			paramNames: [
				"sample",
				"speed",
				"offset",
				"repeat",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"audio",
				"scalar",
				"audio"
			],
			emitNames: ["position", "playing"],
			usesInput: false
		},
		{
			id: 583,
			genName: "Sampler",
			variantName: "default",
			className: "Sampler_default_sample_scalar_speed_scalar_offset_scalar_repeat_scalar_trig_scalar_stereo",
			paramNames: [
				"sample",
				"speed",
				"offset",
				"repeat",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"scalar"
			],
			emitNames: ["position", "playing"],
			usesInput: false
		},
		{
			id: 584,
			genName: "Sampler",
			variantName: "default",
			className: "Sampler_default_sample_scalar_speed_scalar_offset_scalar_repeat_scalar_trig_audio_stereo",
			paramNames: [
				"sample",
				"speed",
				"offset",
				"repeat",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"scalar",
				"scalar",
				"audio"
			],
			emitNames: ["position", "playing"],
			usesInput: false
		},
		{
			id: 585,
			genName: "Sampler",
			variantName: "default",
			className: "Sampler_default_sample_scalar_speed_scalar_offset_audio_repeat_scalar_trig_scalar_stereo",
			paramNames: [
				"sample",
				"speed",
				"offset",
				"repeat",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"audio",
				"scalar",
				"scalar"
			],
			emitNames: ["position", "playing"],
			usesInput: false
		},
		{
			id: 586,
			genName: "Sampler",
			variantName: "default",
			className: "Sampler_default_sample_scalar_speed_scalar_offset_audio_repeat_scalar_trig_audio_stereo",
			paramNames: [
				"sample",
				"speed",
				"offset",
				"repeat",
				"trig"
			],
			paramModes: [
				"scalar",
				"scalar",
				"audio",
				"scalar",
				"audio"
			],
			emitNames: ["position", "playing"],
			usesInput: false
		},
		{
			id: 587,
			genName: "Moog",
			variantName: "lpm",
			className: "Moog_lpm_cutoff_scalar_q_scalar",
			paramNames: ["cutoff", "q"],
			paramModes: ["scalar", "scalar"],
			emitNames: [],
			usesInput: true
		},
		{
			id: 588,
			genName: "Moog",
			variantName: "lpm",
			className: "Moog_lpm_cutoff_audio_q_scalar",
			paramNames: ["cutoff", "q"],
			paramModes: ["audio", "scalar"],
			emitNames: [],
			usesInput: true
		},
		{
			id: 589,
			genName: "Moog",
			variantName: "hpm",
			className: "Moog_hpm_cutoff_scalar_q_scalar",
			paramNames: ["cutoff", "q"],
			paramModes: ["scalar", "scalar"],
			emitNames: [],
			usesInput: true
		},
		{
			id: 590,
			genName: "Moog",
			variantName: "hpm",
			className: "Moog_hpm_cutoff_audio_q_scalar",
			paramNames: ["cutoff", "q"],
			paramModes: ["audio", "scalar"],
			emitNames: [],
			usesInput: true
		},
		{
			id: 591,
			genName: "Svf",
			variantName: "lps",
			className: "Svf_lps_cutoff_scalar_q_scalar",
			paramNames: ["cutoff", "q"],
			paramModes: ["scalar", "scalar"],
			emitNames: [],
			usesInput: true
		},
		{
			id: 592,
			genName: "Svf",
			variantName: "lps",
			className: "Svf_lps_cutoff_scalar_q_audio",
			paramNames: ["cutoff", "q"],
			paramModes: ["scalar", "audio"],
			emitNames: [],
			usesInput: true
		},
		{
			id: 593,
			genName: "Svf",
			variantName: "lps",
			className: "Svf_lps_cutoff_audio_q_scalar",
			paramNames: ["cutoff", "q"],
			paramModes: ["audio", "scalar"],
			emitNames: [],
			usesInput: true
		},
		{
			id: 594,
			genName: "Svf",
			variantName: "lps",
			className: "Svf_lps_cutoff_audio_q_audio",
			paramNames: ["cutoff", "q"],
			paramModes: ["audio", "audio"],
			emitNames: [],
			usesInput: true
		},
		{
			id: 595,
			genName: "Svf",
			variantName: "hps",
			className: "Svf_hps_cutoff_scalar_q_scalar",
			paramNames: ["cutoff", "q"],
			paramModes: ["scalar", "scalar"],
			emitNames: [],
			usesInput: true
		},
		{
			id: 596,
			genName: "Svf",
			variantName: "hps",
			className: "Svf_hps_cutoff_scalar_q_audio",
			paramNames: ["cutoff", "q"],
			paramModes: ["scalar", "audio"],
			emitNames: [],
			usesInput: true
		},
		{
			id: 597,
			genName: "Svf",
			variantName: "hps",
			className: "Svf_hps_cutoff_audio_q_scalar",
			paramNames: ["cutoff", "q"],
			paramModes: ["audio", "scalar"],
			emitNames: [],
			usesInput: true
		},
		{
			id: 598,
			genName: "Svf",
			variantName: "hps",
			className: "Svf_hps_cutoff_audio_q_audio",
			paramNames: ["cutoff", "q"],
			paramModes: ["audio", "audio"],
			emitNames: [],
			usesInput: true
		},
		{
			id: 599,
			genName: "Svf",
			variantName: "bps",
			className: "Svf_bps_cutoff_scalar_q_scalar",
			paramNames: ["cutoff", "q"],
			paramModes: ["scalar", "scalar"],
			emitNames: [],
			usesInput: true
		},
		{
			id: 600,
			genName: "Svf",
			variantName: "bps",
			className: "Svf_bps_cutoff_scalar_q_audio",
			paramNames: ["cutoff", "q"],
			paramModes: ["scalar", "audio"],
			emitNames: [],
			usesInput: true
		},
		{
			id: 601,
			genName: "Svf",
			variantName: "bps",
			className: "Svf_bps_cutoff_audio_q_scalar",
			paramNames: ["cutoff", "q"],
			paramModes: ["audio", "scalar"],
			emitNames: [],
			usesInput: true
		},
		{
			id: 602,
			genName: "Svf",
			variantName: "bps",
			className: "Svf_bps_cutoff_audio_q_audio",
			paramNames: ["cutoff", "q"],
			paramModes: ["audio", "audio"],
			emitNames: [],
			usesInput: true
		},
		{
			id: 603,
			genName: "Svf",
			variantName: "bss",
			className: "Svf_bss_cutoff_scalar_q_scalar",
			paramNames: ["cutoff", "q"],
			paramModes: ["scalar", "scalar"],
			emitNames: [],
			usesInput: true
		},
		{
			id: 604,
			genName: "Svf",
			variantName: "bss",
			className: "Svf_bss_cutoff_scalar_q_audio",
			paramNames: ["cutoff", "q"],
			paramModes: ["scalar", "audio"],
			emitNames: [],
			usesInput: true
		},
		{
			id: 605,
			genName: "Svf",
			variantName: "bss",
			className: "Svf_bss_cutoff_audio_q_scalar",
			paramNames: ["cutoff", "q"],
			paramModes: ["audio", "scalar"],
			emitNames: [],
			usesInput: true
		},
		{
			id: 606,
			genName: "Svf",
			variantName: "bss",
			className: "Svf_bss_cutoff_audio_q_audio",
			paramNames: ["cutoff", "q"],
			paramModes: ["audio", "audio"],
			emitNames: [],
			usesInput: true
		},
		{
			id: 607,
			genName: "Svf",
			variantName: "peaks",
			className: "Svf_peaks_cutoff_scalar_q_scalar",
			paramNames: ["cutoff", "q"],
			paramModes: ["scalar", "scalar"],
			emitNames: [],
			usesInput: true
		},
		{
			id: 608,
			genName: "Svf",
			variantName: "peaks",
			className: "Svf_peaks_cutoff_scalar_q_audio",
			paramNames: ["cutoff", "q"],
			paramModes: ["scalar", "audio"],
			emitNames: [],
			usesInput: true
		},
		{
			id: 609,
			genName: "Svf",
			variantName: "peaks",
			className: "Svf_peaks_cutoff_audio_q_scalar",
			paramNames: ["cutoff", "q"],
			paramModes: ["audio", "scalar"],
			emitNames: [],
			usesInput: true
		},
		{
			id: 610,
			genName: "Svf",
			variantName: "peaks",
			className: "Svf_peaks_cutoff_audio_q_audio",
			paramNames: ["cutoff", "q"],
			paramModes: ["audio", "audio"],
			emitNames: [],
			usesInput: true
		},
		{
			id: 611,
			genName: "Svf",
			variantName: "aps",
			className: "Svf_aps_cutoff_scalar_q_scalar",
			paramNames: ["cutoff", "q"],
			paramModes: ["scalar", "scalar"],
			emitNames: [],
			usesInput: true
		},
		{
			id: 612,
			genName: "Svf",
			variantName: "aps",
			className: "Svf_aps_cutoff_scalar_q_audio",
			paramNames: ["cutoff", "q"],
			paramModes: ["scalar", "audio"],
			emitNames: [],
			usesInput: true
		},
		{
			id: 613,
			genName: "Svf",
			variantName: "aps",
			className: "Svf_aps_cutoff_audio_q_scalar",
			paramNames: ["cutoff", "q"],
			paramModes: ["audio", "scalar"],
			emitNames: [],
			usesInput: true
		},
		{
			id: 614,
			genName: "Svf",
			variantName: "aps",
			className: "Svf_aps_cutoff_audio_q_audio",
			paramNames: ["cutoff", "q"],
			paramModes: ["audio", "audio"],
			emitNames: [],
			usesInput: true
		},
		{
			id: 615,
			genName: "Table",
			variantName: "lookup",
			className: "Table_lookup",
			paramNames: ["len", "index"],
			paramModes: ["scalar", "scalar"],
			emitNames: [],
			usesInput: false
		},
		{
			id: 616,
			genName: "Tram",
			variantName: "default",
			className: "TramKernel",
			paramNames: [],
			paramModes: [],
			emitNames: ["fired"],
			usesInput: false
		},
		{
			id: 617,
			genName: "Mini",
			variantName: "default",
			className: "MiniKernel",
			paramNames: ["bars"],
			paramModes: ["scalar"],
			emitNames: [],
			usesInput: false
		},
		{
			id: 618,
			genName: "Timeline",
			variantName: "default",
			className: "TimelineKernel",
			paramNames: [],
			paramModes: [],
			emitNames: [],
			usesInput: false
		},
		{
			id: 619,
			genName: "Out",
			variantName: "default",
			className: "Out",
			paramNames: [],
			paramModes: [],
			emitNames: [],
			usesInput: false
		},
		{
			id: 620,
			genName: "Mix",
			variantName: "default",
			className: "Mix",
			paramNames: [],
			paramModes: [],
			emitNames: [],
			usesInput: false
		},
		{
			id: 621,
			genName: "ArrayGet",
			variantName: "default",
			className: "ArrayGet",
			paramNames: ["index"],
			paramModes: ["scalar"],
			emitNames: ["index"],
			usesInput: false
		},
		{
			id: 622,
			genName: "Solo",
			variantName: "default",
			className: "Solo",
			paramNames: [],
			paramModes: [],
			emitNames: [],
			usesInput: false
		}
	];
	const MINI_HISTORY_SIZE = 2048;
	const MINI_HISTORY_HEADER_SIZE = 1;
	const MINI_HISTORY_ENTRY_SIZE = 6;
	const MINI_ARRAY_HEADER_SIZE = 2;
	const MINI_HEADER_SIZE = 1;
	const MINI_MAX_EVENT_VALUES = 16;
	let MiniOp = /* @__PURE__ */ function(MiniOp$1) {
		MiniOp$1[MiniOp$1["Event"] = 0] = "Event";
		MiniOp$1[MiniOp$1["GroupStart"] = 1] = "GroupStart";
		MiniOp$1[MiniOp$1["GroupEnd"] = 2] = "GroupEnd";
		MiniOp$1[MiniOp$1["Rest"] = 3] = "Rest";
		MiniOp$1[MiniOp$1["Octave"] = 4] = "Octave";
		MiniOp$1[MiniOp$1["Transpose"] = 5] = "Transpose";
		MiniOp$1[MiniOp$1["Scale"] = 6] = "Scale";
		MiniOp$1[MiniOp$1["CycleStart"] = 7] = "CycleStart";
		MiniOp$1[MiniOp$1["CycleEnd"] = 8] = "CycleEnd";
		MiniOp$1[MiniOp$1["Swing"] = 9] = "Swing";
		return MiniOp$1;
	}({});
	const MINI_GROUP_START_SIZE = 13;
	const MINI_GROUP_END_SIZE = 1;
	const MINI_REST_SIZE = 1;
	const MINI_OCTAVE_SIZE = 2;
	const MINI_TRANSPOSE_SIZE = 2;
	const MINI_SCALE_SIZE = 3;
	const MINI_CYCLE_START_SIZE = 4;
	const MINI_CYCLE_END_SIZE = 1;
	const MINI_EVENT_BASE_SIZE = 12 + MINI_MAX_EVENT_VALUES;
	const MINI_SWING_SIZE = 2;
	function computePeaks(ch0, w$1) {
		const len = ch0.length | 0;
		const outW = Math.max(1, w$1 | 0);
		const out = new Float32Array(outW * 2);
		if (len <= 0) {
			out.fill(0);
			return out;
		}
		for (let i$1 = 0; i$1 < outW; i$1++) {
			const from = Math.floor(i$1 * len / outW);
			const to = Math.floor((i$1 + 1) * len / outW);
			const a$1 = Math.max(0, Math.min(len - 1, from));
			const b$1 = Math.max(a$1 + 1, Math.min(len, to));
			let mn = ch0[a$1] ?? 0;
			let mx = mn;
			for (let j$1 = a$1 + 1; j$1 < b$1; j$1++) {
				const v$1 = ch0[j$1] ?? 0;
				if (v$1 < mn) mn = v$1;
				if (v$1 > mx) mx = v$1;
			}
			const base = i$1 * 2;
			out[base] = mn;
			out[base + 1] = mx;
		}
		return out;
	}
	const clamp$1 = (v$1, lo, hi) => Math.max(lo, Math.min(hi, v$1));
	function detectSlices(samples, threshold, max) {
		const m$1 = Math.max(1, max | 0);
		const points = new Int32Array(m$1);
		const len = samples.length | 0;
		if (len <= 0) return {
			points,
			count: 0
		};
		let count = 0;
		const thr = clamp$1(threshold, 0, 1);
		const desiredBuckets = Math.max(256, Math.min(16384, m$1 * 16 | 0));
		const maxBucketsByMinSize = Math.max(1, Math.floor(len / 32));
		const bucketCount = Math.max(1, Math.min(len, desiredBuckets, maxBucketsByMinSize));
		if (bucketCount <= 1) {
			points[0] = 0;
			return {
				points,
				count: 1
			};
		}
		const peaks = computePeaks(samples, bucketCount);
		const rise = new Float32Array(bucketCount);
		let riseMax = 0;
		let prevAmp = 0;
		for (let i$1 = 0; i$1 < bucketCount; i$1++) {
			const base = i$1 * 2;
			const mn = peaks[base] ?? 0;
			const mx = peaks[base + 1] ?? 0;
			const amp = Math.max(Math.abs(mn), Math.abs(mx));
			const d$1 = i$1 === 0 ? 0 : Math.max(0, amp - prevAmp);
			rise[i$1] = d$1;
			if (d$1 > riseMax) riseMax = d$1;
			prevAmp = amp;
		}
		if (riseMax <= 0) {
			points[0] = 0;
			return {
				points,
				count: 1
			};
		}
		const minRise = riseMax * (.02 + thr * .28);
		const noveltyMin = riseMax * (.01 + thr * .18);
		const ratioMin = thr * .9;
		const minDistanceBuckets = 1 + (thr * 24 | 0);
		const rearmLevel = riseMax * (.006 + thr * .06);
		const cooldownFrames = 1 + (thr * 10 | 0);
		const fastCoeff = .25;
		const slowCoeff = .02;
		let fast = rise[0] ?? 0;
		let slow = fast;
		let prev2 = 0;
		let prev1 = 0;
		let prevFast1 = fast;
		let prevSlow1 = slow;
		let lastPeakBucket = -1073741823;
		let armed = true;
		let cooldown = 0;
		let mg = 0;
		const bucketStart = (b$1) => Math.floor(b$1 * len / bucketCount);
		for (let frame = 1; frame < bucketCount && count < m$1; frame++) {
			const e$1 = rise[frame] ?? 0;
			fast += (e$1 - fast) * fastCoeff;
			slow += (e$1 - slow) * slowCoeff;
			const novelty = Math.max(0, fast - slow);
			const release = .995 + thr * .01;
			mg *= release;
			const mgMul = 1 + mg * (10 + thr * 12);
			const effMinRise = minRise * mgMul;
			const effNoveltyMin = noveltyMin * mgMul;
			const baseMinDistanceBuckets = Math.max(2, Math.floor(minDistanceBuckets * (1 + mg * 2)));
			const effMinDistanceBuckets = count <= 2 ? Math.max(baseMinDistanceBuckets, 4 + (thr * 8 | 0)) : baseMinDistanceBuckets;
			if (!armed && novelty <= rearmLevel) armed = true;
			if (cooldown > 0) cooldown--;
			if (frame >= 2) {
				if (prev1 > prev2 && prev1 >= novelty) {
					const posBucket = frame - 1 | 0;
					const bucketDelta = posBucket - lastPeakBucket;
					const base = Math.max(prevSlow1, riseMax * 1e-5);
					const ratio = prevFast1 / base;
					if (armed && cooldown <= 0 && bucketDelta >= effMinDistanceBuckets && prevFast1 >= effMinRise && ratio >= 1 + ratioMin && prev1 >= effNoveltyMin) {
						const s$1 = bucketStart(posBucket);
						if (s$1 > (count > 0 ? points[count - 1] ?? 0 : -1)) {
							points[count++] = s$1;
							lastPeakBucket = posBucket;
							armed = false;
							cooldown = cooldownFrames;
							mg = Math.min(1, mg + .75);
						}
					}
				}
			}
			prev2 = prev1;
			prev1 = novelty;
			prevFast1 = fast;
			prevSlow1 = slow;
		}
		if (count <= 0) {
			points[0] = 0;
			return {
				points,
				count: 1
			};
		}
		return {
			points,
			count
		};
	}
	var SampleManager = class {
		samples = /* @__PURE__ */ new Map();
		sampleVersion = /* @__PURE__ */ new Map();
		sliceCache = /* @__PURE__ */ new Map();
		freesoundIds = /* @__PURE__ */ new Map();
		recordRequests = /* @__PURE__ */ new Map();
		nextHandle = 1;
		getSampleVersion(handle) {
			return this.sampleVersion.get(handle) ?? 0;
		}
		bumpVersion(handle) {
			this.sampleVersion.set(handle, (this.sampleVersion.get(handle) ?? 0) + 1);
		}
		registerFreesound(id) {
			for (const [handle$1, fsId] of this.freesoundIds.entries()) if (fsId === id) return handle$1;
			const handle = this.nextHandle++;
			this.freesoundIds.set(handle, id);
			this.samples.set(handle, {
				id: handle,
				channels: [],
				length: 0,
				sampleRate: 44100,
				ready: false
			});
			return handle;
		}
		ensureFreesoundHandle(handle, freesoundId) {
			if (this.samples.has(handle)) return;
			this.freesoundIds.set(handle, freesoundId);
			this.samples.set(handle, {
				id: handle,
				channels: [],
				length: 0,
				sampleRate: 44100,
				ready: false
			});
		}
		registerRecord(projectId, seconds, callbackId) {
			const key = `${projectId ?? ""}\0${seconds}\0${callbackId}`;
			for (const [handle$1, req] of this.recordRequests.entries()) if (`${req.projectId ?? ""}\0${req.seconds}\0${req.callbackId}` === key) return handle$1;
			const handle = this.nextHandle++;
			this.recordRequests.set(handle, {
				projectId,
				seconds,
				callbackId
			});
			this.samples.set(handle, {
				id: handle,
				channels: [],
				length: 0,
				sampleRate: 44100,
				ready: false
			});
			return handle;
		}
		ensureRecordHandle(handle, seconds, callbackId) {
			if (this.samples.has(handle)) return;
			this.recordRequests.set(handle, {
				projectId: null,
				seconds,
				callbackId
			});
			this.samples.set(handle, {
				id: handle,
				channels: [],
				length: 0,
				sampleRate: 44100,
				ready: false
			});
		}
		getFreesoundId(handle) {
			return this.freesoundIds.get(handle);
		}
		ensureInlineHandle(handle) {
			if (this.samples.has(handle)) return;
			this.samples.set(handle, {
				id: handle,
				channels: [],
				length: 0,
				sampleRate: 44100,
				ready: false
			});
		}
		registerEspeak() {
			const handle = this.nextHandle++;
			this.samples.set(handle, {
				id: handle,
				channels: [],
				length: 0,
				sampleRate: 44100,
				ready: false
			});
			return handle;
		}
		registerInlineSample(channels, sampleRate$1) {
			const handle = this.nextHandle++;
			const copiedChannels = channels.map((ch) => new Float32Array(ch));
			this.samples.set(handle, {
				id: handle,
				channels: copiedChannels,
				length: copiedChannels[0]?.length ?? 0,
				sampleRate: sampleRate$1,
				ready: copiedChannels.length > 0 && (copiedChannels[0]?.length ?? 0) > 0
			});
			this.bumpVersion(handle);
			return handle;
		}
		getRecordRequest(handle) {
			return this.recordRequests.get(handle);
		}
		setSampleData(handle, channels, sampleRate$1) {
			const sample = this.samples.get(handle);
			if (!sample) return;
			sample.channels = channels;
			sample.length = channels[0]?.length ?? 0;
			sample.sampleRate = sampleRate$1;
			sample.ready = channels.length > 0 && sample.length > 0;
			sample.error = void 0;
			this.bumpVersion(handle);
		}
		setSampleError(handle, error$1) {
			const sample = this.samples.get(handle);
			if (!sample) return;
			sample.error = error$1;
			sample.ready = false;
			this.bumpVersion(handle);
		}
		recordSample(handle, audioData, sampleRate$1) {
			const sample = this.samples.get(handle);
			if (!sample) return;
			sample.channels = audioData.map((ch) => new Float32Array(ch));
			sample.length = audioData[0]?.length ?? 0;
			sample.sampleRate = sampleRate$1;
			sample.ready = sample.channels.length > 0 && sample.length > 0;
			this.bumpVersion(handle);
		}
		getSample(handle) {
			return this.samples.get(handle) ?? null;
		}
		getSlices(handle, threshold) {
			const sample = this.samples.get(handle);
			if (!sample || !sample.ready || sample.channels.length === 0) return {
				points: new Int32Array(1),
				count: 1
			};
			let cacheMap = this.sliceCache.get(handle);
			if (!cacheMap) {
				cacheMap = /* @__PURE__ */ new Map();
				this.sliceCache.set(handle, cacheMap);
			}
			const thresholdKey = Math.round(threshold * 1e3);
			let cached = cacheMap.get(thresholdKey);
			if (cached) return {
				points: cached.points,
				count: cached.count
			};
			const result = detectSlices(sample.channels[0], threshold, 256);
			cached = {
				threshold,
				points: result.points,
				count: result.count
			};
			cacheMap.set(thresholdKey, cached);
			return {
				points: result.points,
				count: result.count
			};
		}
		readChunk(handle, channel, offset, length) {
			const sample = this.samples.get(handle);
			if (!sample || !sample.ready) return new Float32Array(length);
			const ch = sample.channels[channel];
			if (!ch) return new Float32Array(length);
			const start = Math.max(0, Math.min(offset | 0, ch.length));
			const end = Math.max(start, Math.min(start + length, ch.length));
			if (end - start === 0) return new Float32Array(length);
			const result = new Float32Array(length);
			result.set(ch.subarray(start, end));
			return result;
		}
		areAllSamplesReady() {
			for (const sample of this.samples.values()) if (!sample.ready) return false;
			return true;
		}
		getRequiredSamples() {
			return Array.from(this.samples.keys()).filter((handle) => {
				const sample = this.samples.get(handle);
				return sample && !sample.ready;
			});
		}
		getSampleMemoryInfo() {
			let totalChannelBytes = 0;
			for (const sample of this.samples.values()) for (const ch of sample.channels) totalChannelBytes += ch.byteLength;
			return {
				handleCount: this.samples.size,
				totalChannelBytes
			};
		}
		clear() {
			this.samples.clear();
			this.sampleVersion.clear();
			this.sliceCache.clear();
			this.freesoundIds.clear();
			this.recordRequests.clear();
			this.nextHandle = 1;
		}
		clearHandle(handle) {
			const sample = this.samples.get(handle);
			if (sample) {
				sample.channels = [];
				sample.length = 0;
				sample.ready = false;
				sample.error = void 0;
			}
			this.bumpVersion(handle);
			this.sliceCache.delete(handle);
		}
	};
	const sampleManager = new SampleManager();
	function collectParamNames(params) {
		const names = /* @__PURE__ */ new Set();
		for (const p$1 of params) if (p$1.type === "param") names.add(p$1.name);
		else if (p$1.type === "param-destructure") for (const n$1 of p$1.names) names.add(n$1);
		else if (p$1.type === "param-named-destructure") {
			names.add(p$1.paramName);
			for (const n$1 of p$1.names) names.add(n$1);
		}
		return names;
	}
	function collectClosureVarNames(fnExpr, outerLocals, opts) {
		const out = /* @__PURE__ */ new Set();
		const params = collectParamNames(fnExpr.params);
		const inOuterLocals = (name) => {
			for (const scope of outerLocals) if (scope.has(name)) return true;
			return false;
		};
		const walkExpr = (e$1) => {
			switch (e$1.type) {
				case "number":
				case "string": return;
				case "identifier":
					if (!params.has(e$1.name) && !opts.systemVars.has(e$1.name) && inOuterLocals(e$1.name)) out.add(e$1.name);
					return;
				case "array":
					for (const it of e$1.items) walkExpr(it);
					return;
				case "index":
					walkExpr(e$1.object);
					walkExpr(e$1.index);
					return;
				case "member":
					walkExpr(e$1.object);
					return;
				case "unary":
					walkExpr(e$1.expr);
					return;
				case "binary":
					walkExpr(e$1.left);
					walkExpr(e$1.right);
					return;
				case "ternary":
					walkExpr(e$1.test);
					walkExpr(e$1.then);
					walkExpr(e$1.else);
					return;
				case "call":
					walkExpr(e$1.callee);
					for (const a$1 of e$1.args) if (a$1.type === "arg") walkExpr(a$1.value);
					return;
				case "assign":
					if (e$1.left.type === "identifier") {
						walkExpr(e$1.right);
						if (e$1.op !== ":=" && !params.has(e$1.left.name) && !opts.systemVars.has(e$1.left.name) && inOuterLocals(e$1.left.name)) out.add(e$1.left.name);
						return;
					}
					if (e$1.left.type === "destructure") {
						walkExpr(e$1.right);
						for (const name of e$1.left.names) if (e$1.op !== ":=" && !params.has(name) && !opts.systemVars.has(name) && inOuterLocals(name)) out.add(name);
						return;
					}
					walkExpr(e$1.left);
					walkExpr(e$1.right);
					return;
				case "destructure": return;
				case "fn":
					if (e$1.body.type === "block") walkStmt(e$1.body);
					else walkExpr(e$1.body);
					return;
			}
		};
		const walkStmt = (s$1) => {
			switch (s$1.type) {
				case "expr":
					walkExpr(s$1.expr);
					return;
				case "block":
					for (const it of s$1.body) walkStmt(it);
					return;
				case "if":
					walkExpr(s$1.test);
					walkStmt(s$1.then);
					if (s$1.else) walkStmt(s$1.else);
					return;
				case "while":
					walkExpr(s$1.test);
					walkStmt(s$1.body);
					return;
				case "do":
					walkStmt(s$1.body);
					walkExpr(s$1.test);
					return;
				case "for":
					walkExpr(s$1.from);
					walkExpr(s$1.to);
					walkStmt(s$1.body);
					return;
				case "for-of":
					walkExpr(s$1.iterable);
					walkStmt(s$1.body);
					return;
				case "return":
					if (s$1.value) walkExpr(s$1.value);
					return;
				case "throw":
					if (s$1.value) walkExpr(s$1.value);
					return;
				case "try":
					walkStmt(s$1.body);
					if (s$1.catch) walkStmt(s$1.catch.body);
					if (s$1.finally) walkStmt(s$1.finally);
					return;
				case "label":
					walkStmt(s$1.stmt);
					return;
				case "break":
				case "continue": return;
			}
		};
		if (fnExpr.defaults) {
			for (const defaultExpr of fnExpr.defaults) if (defaultExpr) walkExpr(defaultExpr);
		}
		if (fnExpr.body.type === "block") walkStmt(fnExpr.body);
		else walkExpr(fnExpr.body);
		return Array.from(out);
	}
	function collectCapturedVarNames(body, opts) {
		const out = /* @__PURE__ */ new Set();
		const add = (name) => {
			if (name === "$") return;
			if (opts.systemVars.has(name)) return;
			out.add(name);
		};
		const walkExpr = (e$1) => {
			switch (e$1.type) {
				case "number":
				case "string": return;
				case "identifier":
					add(e$1.name);
					return;
				case "array":
					for (const it of e$1.items) walkExpr(it);
					return;
				case "index":
					walkExpr(e$1.object);
					walkExpr(e$1.index);
					return;
				case "member":
					walkExpr(e$1.object);
					return;
				case "unary":
					walkExpr(e$1.expr);
					return;
				case "binary":
					walkExpr(e$1.left);
					walkExpr(e$1.right);
					return;
				case "ternary":
					walkExpr(e$1.test);
					walkExpr(e$1.then);
					walkExpr(e$1.else);
					return;
				case "call":
					walkExpr(e$1.callee);
					for (const a$1 of e$1.args) if (a$1.type === "arg") walkExpr(a$1.value);
					return;
				case "assign":
					if (e$1.left.type === "identifier" && e$1.op !== ":=") add(e$1.left.name);
					if (e$1.left.type === "destructure" && e$1.op !== ":=") for (const name of e$1.left.names) add(name);
					if (e$1.left.type !== "identifier" && e$1.left.type !== "destructure") walkExpr(e$1.left);
					walkExpr(e$1.right);
					return;
				case "destructure": return;
				case "fn": return;
			}
		};
		const walkStmt = (s$1) => {
			switch (s$1.type) {
				case "expr":
					walkExpr(s$1.expr);
					return;
				case "block":
					for (const it of s$1.body) walkStmt(it);
					return;
				case "if":
					walkExpr(s$1.test);
					walkStmt(s$1.then);
					if (s$1.else) walkStmt(s$1.else);
					return;
				case "while":
					walkExpr(s$1.test);
					walkStmt(s$1.body);
					return;
				case "do":
					walkStmt(s$1.body);
					walkExpr(s$1.test);
					return;
				case "for":
					walkExpr(s$1.from);
					walkExpr(s$1.to);
					walkStmt(s$1.body);
					return;
				case "for-of":
					walkExpr(s$1.iterable);
					walkStmt(s$1.body);
					return;
				case "return":
					if (s$1.value) walkExpr(s$1.value);
					return;
				case "throw":
					if (s$1.value) walkExpr(s$1.value);
					return;
				case "try":
					walkStmt(s$1.body);
					if (s$1.catch) walkStmt(s$1.catch.body);
					if (s$1.finally) walkStmt(s$1.finally);
					return;
				case "label":
					walkStmt(s$1.stmt);
					return;
				case "break":
				case "continue": return;
			}
		};
		if ([
			"number",
			"string",
			"identifier",
			"fn",
			"array",
			"index",
			"unary",
			"binary",
			"ternary",
			"call",
			"member",
			"assign",
			"destructure"
		].includes(body.type)) {
			walkExpr(body);
			return Array.from(out);
		}
		walkStmt(body);
		return Array.from(out);
	}
	function assignRecordCallIds(program) {
		const recordCallIds = /* @__PURE__ */ new Map();
		let nextRecordId = 0;
		const getLocKey = (loc) => {
			return `${loc.line}:${loc.column}:${loc.start}:${loc.end}`;
		};
		const functionsWithRecord = /* @__PURE__ */ new Set();
		const functionToRecordCall = /* @__PURE__ */ new Map();
		const checkForRecord = (expr) => {
			if (expr.type === "call" && expr.callee.type === "identifier" && expr.callee.name === "record") return true;
			switch (expr.type) {
				case "number":
				case "string":
				case "identifier": return false;
				case "destructure": return false;
				case "array":
					for (const it of expr.items) if (checkForRecord(it)) return true;
					return false;
				case "index": return checkForRecord(expr.object) || checkForRecord(expr.index);
				case "member": return checkForRecord(expr.object);
				case "unary": return checkForRecord(expr.expr);
				case "binary": return checkForRecord(expr.left) || checkForRecord(expr.right);
				case "ternary": return checkForRecord(expr.test) || checkForRecord(expr.then) || checkForRecord(expr.else);
				case "call":
					if (checkForRecord(expr.callee)) return true;
					for (const a$1 of expr.args) if (a$1.type === "arg" && checkForRecord(a$1.value)) return true;
					return false;
				case "assign": return checkForRecord(expr.left) || checkForRecord(expr.right);
				case "fn": return false;
			}
		};
		const checkStmtForRecord = (s$1) => {
			switch (s$1.type) {
				case "expr": return checkForRecord(s$1.expr);
				case "block":
					for (const it of s$1.body) if (checkStmtForRecord(it)) return true;
					return false;
				case "if": return checkForRecord(s$1.test) || checkStmtForRecord(s$1.then) || (s$1.else ? checkStmtForRecord(s$1.else) : false);
				case "while": return checkForRecord(s$1.test) || checkStmtForRecord(s$1.body);
				case "do": return checkStmtForRecord(s$1.body) || checkForRecord(s$1.test);
				case "for": return checkForRecord(s$1.from) || checkForRecord(s$1.to) || checkStmtForRecord(s$1.body);
				case "for-of": return checkForRecord(s$1.iterable) || checkStmtForRecord(s$1.body);
				case "return": return s$1.value ? checkForRecord(s$1.value) : false;
				case "throw": return s$1.value ? checkForRecord(s$1.value) : false;
				case "try": return checkStmtForRecord(s$1.body) || (s$1.catch ? checkStmtForRecord(s$1.catch.body) : false) || (s$1.finally ? checkStmtForRecord(s$1.finally) : false);
				case "label": return checkStmtForRecord(s$1.stmt);
				case "break":
				case "continue": return false;
			}
		};
		const findRecordCallLoc = (expr) => {
			if (expr.type === "call" && expr.callee.type === "identifier" && expr.callee.name === "record") return getLocKey(expr.loc);
			switch (expr.type) {
				case "number":
				case "string":
				case "identifier": return null;
				case "array":
					for (const it of expr.items) {
						const loc = findRecordCallLoc(it);
						if (loc) return loc;
					}
					return null;
				case "index": return findRecordCallLoc(expr.object) || findRecordCallLoc(expr.index);
				case "member": return findRecordCallLoc(expr.object);
				case "unary": return findRecordCallLoc(expr.expr);
				case "binary": return findRecordCallLoc(expr.left) || findRecordCallLoc(expr.right);
				case "ternary": return findRecordCallLoc(expr.test) || findRecordCallLoc(expr.then) || findRecordCallLoc(expr.else);
				case "call":
					const calleeLoc = findRecordCallLoc(expr.callee);
					if (calleeLoc) return calleeLoc;
					for (const a$1 of expr.args) if (a$1.type === "arg") {
						const argLoc = findRecordCallLoc(a$1.value);
						if (argLoc) return argLoc;
					}
					return null;
				case "assign": return findRecordCallLoc(expr.left) || findRecordCallLoc(expr.right);
				case "destructure": return null;
				case "fn": return null;
			}
		};
		const findRecordCallLocInStmt = (s$1) => {
			switch (s$1.type) {
				case "expr": return findRecordCallLoc(s$1.expr);
				case "block":
					for (const it of s$1.body) {
						const loc = findRecordCallLocInStmt(it);
						if (loc) return loc;
					}
					return null;
				case "if": return findRecordCallLoc(s$1.test) || findRecordCallLocInStmt(s$1.then) || (s$1.else ? findRecordCallLocInStmt(s$1.else) : null);
				case "while": return findRecordCallLoc(s$1.test) || findRecordCallLocInStmt(s$1.body);
				case "do": return findRecordCallLocInStmt(s$1.body) || findRecordCallLoc(s$1.test);
				case "for": return findRecordCallLoc(s$1.from) || findRecordCallLoc(s$1.to) || findRecordCallLocInStmt(s$1.body);
				case "for-of": return findRecordCallLoc(s$1.iterable) || findRecordCallLocInStmt(s$1.body);
				case "return": return s$1.value ? findRecordCallLoc(s$1.value) : null;
				case "throw": return s$1.value ? findRecordCallLoc(s$1.value) : null;
				case "try": return findRecordCallLocInStmt(s$1.body) || (s$1.catch ? findRecordCallLocInStmt(s$1.catch.body) : null) || (s$1.finally ? findRecordCallLocInStmt(s$1.finally) : null);
				case "label": return findRecordCallLocInStmt(s$1.stmt);
				case "break":
				case "continue": return null;
			}
		};
		const discoverRecordFunctions = () => {
			const walkExpr$1 = (e$1) => {
				if (e$1.type === "assign" && e$1.left.type === "identifier" && e$1.right.type === "fn") {
					const funcName = e$1.left.name;
					if (e$1.right.body.type === "block" ? checkStmtForRecord(e$1.right.body) : checkForRecord(e$1.right.body)) {
						functionsWithRecord.add(funcName);
						const recordLocKey = e$1.right.body.type === "block" ? findRecordCallLocInStmt(e$1.right.body) : findRecordCallLoc(e$1.right.body);
						if (recordLocKey) functionToRecordCall.set(funcName, recordLocKey);
					}
				}
				switch (e$1.type) {
					case "number":
					case "string":
					case "identifier":
					case "destructure": return;
					case "array":
						for (const it of e$1.items) walkExpr$1(it);
						return;
					case "index":
						walkExpr$1(e$1.object);
						walkExpr$1(e$1.index);
						return;
					case "member":
						walkExpr$1(e$1.object);
						return;
					case "unary":
						walkExpr$1(e$1.expr);
						return;
					case "binary":
						walkExpr$1(e$1.left);
						walkExpr$1(e$1.right);
						return;
					case "ternary":
						walkExpr$1(e$1.test);
						walkExpr$1(e$1.then);
						walkExpr$1(e$1.else);
						return;
					case "call":
						walkExpr$1(e$1.callee);
						for (const a$1 of e$1.args) if (a$1.type === "arg") walkExpr$1(a$1.value);
						return;
					case "assign":
						walkExpr$1(e$1.left);
						walkExpr$1(e$1.right);
						return;
					case "fn":
						if (e$1.body.type === "block") walkStmt$1(e$1.body);
						else walkExpr$1(e$1.body);
						return;
				}
			};
			const walkStmt$1 = (s$1) => {
				switch (s$1.type) {
					case "expr":
						walkExpr$1(s$1.expr);
						return;
					case "block":
						for (const it of s$1.body) walkStmt$1(it);
						return;
					case "if":
						walkExpr$1(s$1.test);
						walkStmt$1(s$1.then);
						if (s$1.else) walkStmt$1(s$1.else);
						return;
					case "while":
						walkExpr$1(s$1.test);
						walkStmt$1(s$1.body);
						return;
					case "do":
						walkStmt$1(s$1.body);
						walkExpr$1(s$1.test);
						return;
					case "for":
						walkExpr$1(s$1.from);
						walkExpr$1(s$1.to);
						walkStmt$1(s$1.body);
						return;
					case "for-of":
						walkExpr$1(s$1.iterable);
						walkStmt$1(s$1.body);
						return;
					case "return":
						if (s$1.value) walkExpr$1(s$1.value);
						return;
					case "throw":
						if (s$1.value) walkExpr$1(s$1.value);
						return;
					case "try":
						walkStmt$1(s$1.body);
						if (s$1.catch) walkStmt$1(s$1.catch.body);
						if (s$1.finally) walkStmt$1(s$1.finally);
						return;
					case "label":
						walkStmt$1(s$1.stmt);
						return;
					case "break":
					case "continue": return;
				}
			};
			for (const stmt of program.body) walkStmt$1(stmt);
		};
		discoverRecordFunctions();
		let inFunctionBody = false;
		const walkExpr = (e$1) => {
			switch (e$1.type) {
				case "number":
				case "string":
				case "identifier": return;
				case "array":
					for (const it of e$1.items) walkExpr(it);
					return;
				case "index":
					walkExpr(e$1.object);
					walkExpr(e$1.index);
					return;
				case "member":
					walkExpr(e$1.object);
					return;
				case "unary":
					walkExpr(e$1.expr);
					return;
				case "binary":
					walkExpr(e$1.left);
					walkExpr(e$1.right);
					return;
				case "ternary":
					walkExpr(e$1.test);
					walkExpr(e$1.then);
					walkExpr(e$1.else);
					return;
				case "call":
					if (e$1.callee.type === "identifier") {
						if (e$1.callee.name === "record") {
							if (!inFunctionBody) {
								const locKey = getLocKey(e$1.loc);
								if (!recordCallIds.has(locKey)) recordCallIds.set(locKey, nextRecordId++);
							}
						} else if (functionsWithRecord.has(e$1.callee.name)) {
							const callSiteLocKey = getLocKey(e$1.loc);
							if (!recordCallIds.has(callSiteLocKey)) recordCallIds.set(callSiteLocKey, nextRecordId++);
						}
					}
					walkExpr(e$1.callee);
					for (const a$1 of e$1.args) if (a$1.type === "arg") walkExpr(a$1.value);
					return;
				case "assign":
					walkExpr(e$1.left);
					walkExpr(e$1.right);
					return;
				case "destructure": return;
				case "fn":
					const savedInFunctionBody = inFunctionBody;
					inFunctionBody = true;
					if (e$1.body.type === "block") walkStmt(e$1.body);
					else walkExpr(e$1.body);
					inFunctionBody = savedInFunctionBody;
					return;
			}
		};
		const walkStmt = (s$1) => {
			switch (s$1.type) {
				case "expr":
					walkExpr(s$1.expr);
					return;
				case "block":
					for (const it of s$1.body) walkStmt(it);
					return;
				case "if":
					walkExpr(s$1.test);
					walkStmt(s$1.then);
					if (s$1.else) walkStmt(s$1.else);
					return;
				case "while":
					walkExpr(s$1.test);
					walkStmt(s$1.body);
					return;
				case "do":
					walkStmt(s$1.body);
					walkExpr(s$1.test);
					return;
				case "for":
					walkExpr(s$1.from);
					walkExpr(s$1.to);
					walkStmt(s$1.body);
					return;
				case "for-of":
					walkExpr(s$1.iterable);
					walkStmt(s$1.body);
					return;
				case "return":
					if (s$1.value) walkExpr(s$1.value);
					return;
				case "throw":
					if (s$1.value) walkExpr(s$1.value);
					return;
				case "try":
					walkStmt(s$1.body);
					if (s$1.catch) walkStmt(s$1.catch.body);
					if (s$1.finally) walkStmt(s$1.finally);
					return;
				case "label":
					walkStmt(s$1.stmt);
					return;
				case "break":
				case "continue": return;
			}
		};
		for (const stmt of program.body) walkStmt(stmt);
		return {
			recordCallIds,
			functionToRecordCall
		};
	}
	const gens = {
		Phasor: {
			name: "Phasor",
			description: "Phase ramp 0..1 with trigger reset",
			category: "generators",
			parameters: [
				{
					name: "hz",
					default: 440,
					min: 0,
					unit: "hz",
					description: "Frequency"
				},
				{
					name: "offset",
					min: 0,
					max: 1,
					description: "Offset phase"
				},
				{
					name: "trig",
					description: "Trigger impulse"
				}
			]
		},
		Every: {
			name: "Every",
			description: "Generates an impulse on a regular period in bars",
			category: "sequencers",
			parameters: [{
				name: "bars",
				default: .25,
				min: 1e-4,
				unit: "bars",
				description: "Number of bars per impulse"
			}]
		},
		White: {
			name: "White",
			description: "Uniform white noise with trigger reset",
			category: "generators",
			parameters: [{
				name: "seed",
				default: 0,
				description: "Seed (any value, float bits used)"
			}, {
				name: "trig",
				description: "Trigger resets phase"
			}]
		},
		Lfosqr: {
			name: "Lfosqr",
			description: "Tempo-synced LFO square 0..1",
			category: "generators",
			parameters: [
				{
					name: "bar",
					default: 1,
					min: 0,
					unit: "bars",
					description: "Cycle length in bars"
				},
				{
					name: "offset",
					default: 0,
					min: 0,
					description: "Phase offset in beats"
				},
				{
					name: "trig",
					description: "Trigger reset"
				}
			]
		},
		Lfosah: {
			name: "Lfosah",
			description: "Tempo-synced LFO sample-and-hold (random 0..1 per cycle)",
			category: "generators",
			parameters: [
				{
					name: "bar",
					default: 1,
					min: 0,
					unit: "bars",
					description: "Cycle length in bars"
				},
				{
					name: "offset",
					default: 0,
					min: 0,
					description: "Phase offset in beats"
				},
				{
					name: "seed",
					default: 0,
					description: "Seed (any value, float bits used)"
				},
				{
					name: "trig",
					description: "Trigger reset"
				}
			]
		},
		Dc: {
			name: "Dc",
			description: "DC blocker (~8 Hz highpass, removes offset)",
			category: "filters",
			parameters: [{
				name: "input",
				description: "Input signal"
			}]
		},
		Gauss: {
			name: "Gauss",
			description: "Gaussian (normal-ish) noise via CLT from 6 uniforms, trigger reset",
			category: "generators",
			parameters: [{
				name: "seed",
				default: 0,
				description: "Seed (any value, float bits used)"
			}, {
				name: "trig",
				description: "Trigger resets phase"
			}]
		},
		Impulse: {
			name: "Impulse",
			description: "Impulse train (1 at phase 0, 0 elsewhere)",
			category: "sequencers",
			parameters: [
				{
					name: "hz",
					default: 440,
					min: 0,
					unit: "hz",
					description: "Frequency"
				},
				{
					name: "offset",
					min: 0,
					max: 1,
					description: "Offset phase"
				},
				{
					name: "trig",
					description: "Trigger impulse"
				}
			]
		},
		TestGain: {
			name: "TestGain",
			description: "Simple gain/amplifier",
			category: "test",
			parameters: [{
				name: "input",
				description: "Input signal"
			}, {
				name: "amount",
				default: 1,
				min: 0,
				max: 2,
				description: "Gain amount"
			}]
		},
		Freeverb: {
			name: "Freeverb",
			description: "Freeverb reverb",
			category: "effects",
			parameters: [
				{
					name: "input",
					description: "Input signal"
				},
				{
					name: "room",
					default: .5,
					min: 0,
					max: 1,
					unit: "normal",
					description: "Room size"
				},
				{
					name: "damping",
					default: .5,
					min: 0,
					max: 1,
					unit: "normal",
					description: "Damping"
				}
			]
		},
		Saw: {
			name: "Saw",
			description: "Band-limited sawtooth oscillator",
			category: "generators",
			parameters: [
				{
					name: "hz",
					default: 440,
					min: 0,
					unit: "hz",
					description: "Frequency"
				},
				{
					name: "offset",
					min: 0,
					max: 1,
					description: "Offset phase"
				},
				{
					name: "trig",
					description: "Trigger impulse"
				}
			]
		},
		TestOversample: {
			name: "TestOversample",
			description: "Test generator that outputs sample rate dependent signal",
			category: "test",
			parameters: []
		},
		Sine: {
			name: "Sine",
			description: "Sine wave generator",
			category: "generators",
			parameters: [
				{
					name: "hz",
					default: 440,
					min: 0,
					unit: "hz",
					description: "Frequency"
				},
				{
					name: "offset",
					min: 0,
					max: 1,
					unit: "phase",
					description: "Offset phase"
				},
				{
					name: "trig",
					unit: "impulse",
					description: "Trigger impulse"
				}
			]
		},
		Lfosine: {
			name: "Lfosine",
			description: "Tempo-synced LFO sine 0..1",
			category: "generators",
			parameters: [
				{
					name: "bar",
					default: 1,
					min: 0,
					unit: "bars",
					description: "Cycle length in bars"
				},
				{
					name: "offset",
					default: 0,
					min: 0,
					description: "Phase offset in beats"
				},
				{
					name: "trig",
					description: "Trigger reset"
				}
			]
		},
		Slicer: {
			name: "Slicer",
			description: "Slice-based sample player",
			category: "samplers",
			parameters: [
				{
					name: "sample",
					unit: "handle",
					description: "Sample handle from freesound() or record()"
				},
				{
					name: "speed",
					default: 1,
					unit: "multiplier",
					description: "Playback speed (negative for reverse)"
				},
				{
					name: "offset",
					default: 0,
					min: 0,
					max: 1,
					unit: "phase",
					description: "Offset phase within slice"
				},
				{
					name: "slice",
					default: 0,
					min: 0,
					max: 1,
					unit: "fraction",
					description: "Slice index (0..1)"
				},
				{
					name: "threshold",
					default: 0,
					min: 0,
					max: 1,
					unit: "fraction",
					description: "Slice detection threshold"
				},
				{
					name: "repeat",
					default: 0,
					unit: "boolean",
					description: "Loop slice when not 0"
				},
				{
					name: "trig",
					description: "Trigger to restart playback"
				}
			]
		},
		Brown: {
			name: "Brown",
			description: "Brownian (random walk) noise",
			category: "generators",
			parameters: [{
				name: "seed",
				default: 0,
				description: "Seed"
			}, {
				name: "trig",
				description: "Trigger resets walk"
			}]
		},
		Euclid: {
			name: "Euclid",
			description: "Euclidean rhythm trigger (pulses over steps with offset)",
			category: "sequencers",
			parameters: [
				{
					name: "pulses",
					default: 4,
					min: 0,
					description: "Number of hits"
				},
				{
					name: "steps",
					default: 8,
					min: 1,
					description: "Number of steps"
				},
				{
					name: "offset",
					default: 0,
					min: 0,
					description: "Rotation offset"
				},
				{
					name: "bar",
					default: 1,
					min: 0,
					unit: "bars",
					description: "Pattern length in bars"
				}
			]
		},
		Pwm: {
			name: "Pwm",
			description: "Band-limited PWM oscillator",
			category: "generators",
			parameters: [
				{
					name: "hz",
					default: 440,
					min: 0,
					unit: "hz",
					description: "Frequency"
				},
				{
					name: "width",
					default: .5,
					min: 0,
					max: 1,
					description: "Pulse width"
				},
				{
					name: "offset",
					min: 0,
					max: 1,
					description: "Offset phase"
				},
				{
					name: "trig",
					description: "Trigger impulse"
				}
			]
		},
		Ad: {
			name: "Ad",
			description: "Attack/Decay envelope",
			category: "generators",
			parameters: [
				{
					name: "attack",
					default: .005,
					min: 1e-5,
					unit: "s",
					description: "Attack time"
				},
				{
					name: "decay",
					default: .2,
					min: 1e-5,
					unit: "s",
					description: "Decay time"
				},
				{
					name: "exponent",
					default: 1,
					description: "Curve (0=linear, >0=power, <0=mirrored)"
				},
				{
					name: "trig",
					description: "Trigger impulse"
				}
			]
		},
		Onepole: {
			name: "Onepole",
			description: "One-pole filter (lowpass / highpass)",
			category: "filters",
			variants: {
				lp1: "Lowpass filter (One-pole)",
				hp1: "Highpass filter (One-pole)"
			},
			parameters: [{
				name: "input",
				description: "Input signal"
			}, {
				name: "cutoff",
				default: 1e3,
				min: 20,
				max: 2e4,
				unit: "hz",
				description: "Cutoff frequency"
			}]
		},
		Sqr: {
			name: "Sqr",
			description: "Band-limited square oscillator",
			category: "generators",
			parameters: [
				{
					name: "hz",
					default: 440,
					min: 0,
					unit: "hz",
					description: "Frequency"
				},
				{
					name: "offset",
					min: 0,
					max: 1,
					description: "Offset phase"
				},
				{
					name: "trig",
					description: "Trigger impulse"
				}
			]
		},
		Hold: {
			name: "Hold",
			description: "Holds its input if zero is received",
			category: "utilities",
			parameters: [{
				name: "input",
				description: "Input signal"
			}]
		},
		Lfosaw: {
			name: "Lfosaw",
			description: "Tempo-synced LFO saw 0..1",
			category: "generators",
			parameters: [
				{
					name: "bar",
					default: 1,
					min: 0,
					unit: "bars",
					description: "Cycle length in bars"
				},
				{
					name: "offset",
					default: 0,
					min: 0,
					description: "Phase offset in beats"
				},
				{
					name: "trig",
					description: "Trigger reset"
				}
			]
		},
		Compressor: {
			name: "Compressor",
			description: "Dynamic range compressor with soft knee",
			category: "mixing",
			parameters: [
				{
					name: "input",
					description: "Input signal"
				},
				{
					name: "attack",
					default: .003,
					min: 1e-4,
					max: 1,
					unit: "s",
					description: "Attack time"
				},
				{
					name: "release",
					default: .1,
					min: 1e-4,
					max: 5,
					unit: "s",
					description: "Release time"
				},
				{
					name: "threshold",
					default: -12,
					min: -80,
					max: 0,
					unit: "dB",
					description: "Threshold in dB"
				},
				{
					name: "ratio",
					default: 4,
					min: 1,
					max: 20,
					description: "Compression ratio"
				},
				{
					name: "knee",
					default: 6,
					min: 0,
					max: 40,
					unit: "dB",
					description: "Knee width in dB"
				},
				{
					name: "key",
					description: "Key/sidechain input (unpatched = use input as key)"
				}
			]
		},
		Emit: {
			name: "Emit",
			description: "Emits a value",
			category: "test",
			parameters: [{
				name: "value",
				description: "Value to emit"
			}]
		},
		Fractal: {
			name: "Fractal",
			description: "Fractal (octave-sum) noise with rate, octaves, gain",
			category: "generators",
			parameters: [
				{
					name: "seed",
					default: 0,
					description: "Seed"
				},
				{
					name: "rate",
					default: 2,
					min: 0,
					unit: "hz",
					description: "Base rate"
				},
				{
					name: "octaves",
					default: 4,
					min: 1,
					max: 16,
					description: "Number of octaves"
				},
				{
					name: "gain",
					default: .5,
					min: 0,
					max: 1,
					description: "Octave amplitude decay"
				},
				{
					name: "trig",
					description: "Trigger resets phase"
				}
			]
		},
		Lforamp: {
			name: "Lforamp",
			description: "Tempo-synced LFO ramp 0..1",
			category: "generators",
			parameters: [
				{
					name: "bar",
					default: 1,
					min: 0,
					unit: "bars",
					description: "Cycle length in bars"
				},
				{
					name: "offset",
					default: 0,
					min: 0,
					description: "Phase offset in beats"
				},
				{
					name: "trig",
					description: "Trigger reset"
				}
			]
		},
		Tri: {
			name: "Tri",
			description: "Band-limited triangle oscillator",
			category: "generators",
			parameters: [
				{
					name: "hz",
					default: 440,
					min: 0,
					unit: "hz",
					description: "Frequency"
				},
				{
					name: "offset",
					min: 0,
					max: 1,
					description: "Offset phase"
				},
				{
					name: "trig",
					description: "Trigger impulse"
				}
			]
		},
		Pitchshift: {
			name: "Pitchshift",
			description: "Grain-based pitch shifter (overlap-add)",
			category: "effects",
			parameters: [{
				name: "input",
				description: "Input signal"
			}, {
				name: "ratio",
				default: 1,
				min: .01,
				max: 10,
				unit: "multiplier",
				description: "Pitch ratio (e.g. 2 = one octave up)"
			}]
		},
		Zerox: {
			name: "Zerox",
			description: "Positive zero-crossing detector (1 when input crosses from ≤0 to >0)",
			category: "utilities",
			parameters: [{
				name: "input",
				description: "Input signal"
			}]
		},
		Limiter: {
			name: "Limiter",
			description: "Peak limiter with release smoothing",
			category: "mixing",
			parameters: [
				{
					name: "input",
					description: "Input signal"
				},
				{
					name: "threshold",
					default: 0,
					min: -80,
					max: 0,
					unit: "dB",
					description: "Limit threshold in dB"
				},
				{
					name: "release",
					default: .1,
					min: 1e-4,
					max: 5,
					unit: "s",
					description: "Release time"
				}
			]
		},
		At: {
			name: "At",
			description: "Probabilistic trigger at bar start and/or every N bars",
			category: "sequencers",
			parameters: [
				{
					name: "bar",
					default: 0,
					min: 0,
					unit: "bars",
					description: "Start time in bars"
				},
				{
					name: "every",
					default: .25,
					min: 0,
					unit: "bars",
					description: "Interval in bars (0 = single trigger at start)"
				},
				{
					name: "prob",
					default: 1,
					min: 0,
					max: 1,
					unit: "factor",
					description: "Probability of 1 when trigger fires"
				},
				{
					name: "seed",
					default: 0,
					description: "Seed for deterministic random"
				}
			]
		},
		Diodeladder: {
			name: "Diodeladder",
			description: "Diode ladder filter (4-pole, with HPF and soft saturation)",
			category: "filters",
			parameters: [
				{
					name: "input",
					description: "Input signal"
				},
				{
					name: "cutoff",
					default: 1e3,
					min: 20,
					max: 2e4,
					unit: "hz",
					description: "Cutoff frequency"
				},
				{
					name: "q",
					default: .5,
					min: 0,
					max: 1,
					description: "Resonance"
				},
				{
					name: "k",
					default: 0,
					min: 0,
					max: 1,
					description: "HPF amount"
				},
				{
					name: "sat",
					default: 1,
					min: .1,
					max: 10,
					description: "Input saturation"
				}
			]
		},
		Ramp: {
			name: "Ramp",
			description: "Band-limited ramp (inverse saw) oscillator",
			category: "generators",
			parameters: [
				{
					name: "hz",
					default: 440,
					min: 0,
					unit: "hz",
					description: "Frequency"
				},
				{
					name: "offset",
					min: 0,
					max: 1,
					description: "Offset phase"
				},
				{
					name: "trig",
					description: "Trigger impulse"
				}
			]
		},
		Smooth: {
			name: "Smooth",
			description: "Smooth interpolated random steps with rate and curve",
			category: "generators",
			parameters: [
				{
					name: "seed",
					default: 0,
					description: "Seed"
				},
				{
					name: "rate",
					default: 2,
					min: 0,
					unit: "hz",
					description: "Step rate"
				},
				{
					name: "curve",
					default: 1,
					description: "Interpolation curve (0=linear, 1=smooth5)"
				},
				{
					name: "trig",
					description: "Trigger resets acc"
				}
			]
		},
		Lfotri: {
			name: "Lfotri",
			description: "Tempo-synced LFO triangle 0..1",
			category: "generators",
			parameters: [
				{
					name: "bar",
					default: 1,
					min: 0,
					unit: "bars",
					description: "Cycle length in bars"
				},
				{
					name: "offset",
					default: 0,
					min: 0,
					description: "Phase offset in beats"
				},
				{
					name: "trig",
					description: "Trigger reset"
				}
			]
		},
		Adsr: {
			name: "Adsr",
			description: "Attack/Decay/Sustain/Release envelope",
			category: "generators",
			parameters: [
				{
					name: "attack",
					default: .005,
					min: 1e-5,
					unit: "s",
					description: "Attack time"
				},
				{
					name: "decay",
					default: .2,
					min: 1e-5,
					unit: "s",
					description: "Decay time"
				},
				{
					name: "sustain",
					default: .7,
					min: 0,
					max: 1,
					description: "Sustain level (0..1)"
				},
				{
					name: "release",
					default: .3,
					min: 1e-5,
					unit: "s",
					description: "Release time"
				},
				{
					name: "exponent",
					default: 1,
					description: "Curve (0=linear, >0=power, <0=mirrored)"
				},
				{
					name: "trig",
					description: "Trigger (gate): high = hold sustain, low = release"
				}
			]
		},
		Analyser: {
			name: "Analyser",
			description: "Analyze the signal",
			category: "utilities",
			parameters: [{
				name: "input",
				description: "Input signal"
			}]
		},
		Biquad: {
			name: "Biquad",
			description: "Biquad filter",
			category: "filters",
			variants: {
				lp: "Lowpass filter (Biquad)",
				hp: "Highpass filter (Biquad)",
				bp: "Bandpass filter (Biquad)",
				bs: "Bandstop filter (Biquad)",
				ap: "Allpass filter (Biquad)"
			},
			parameters: [
				{
					name: "input",
					description: "Input signal"
				},
				{
					name: "cutoff",
					default: 1e3,
					min: 20,
					max: 2e4,
					unit: "hz",
					description: "Cutoff frequency"
				},
				{
					name: "q",
					default: .70710678,
					min: .01,
					max: 20,
					description: "Q factor"
				}
			]
		},
		Envfollow: {
			name: "Envfollow",
			description: "Envelope follower with attack and release time",
			category: "utilities",
			parameters: [
				{
					name: "input",
					description: "Input signal"
				},
				{
					name: "attack",
					default: .01,
					min: 1e-4,
					max: 10,
					unit: "s",
					description: "Attack time"
				},
				{
					name: "release",
					default: .1,
					min: 1e-4,
					max: 10,
					unit: "s",
					description: "Release time"
				}
			]
		},
		Sah: {
			name: "Sah",
			description: "Sample-and-hold: capture input on trigger rising edge",
			category: "utilities",
			parameters: [{
				name: "input",
				description: "Input signal"
			}, {
				name: "trig",
				description: "Trigger: on rising edge, hold current input"
			}]
		},
		Velvet: {
			name: "Velvet",
			description: "Velvet noise stereo reverb (prime-based delay lines)",
			category: "effects",
			parameters: [
				{
					name: "input",
					description: "Input signal"
				},
				{
					name: "room",
					default: .5,
					min: .05,
					max: 1,
					unit: "normal",
					description: "Room size"
				},
				{
					name: "damping",
					default: .5,
					min: 0,
					max: 1,
					unit: "normal",
					description: "High-frequency damping"
				},
				{
					name: "decay",
					default: .5,
					min: 0,
					max: 1,
					unit: "normal",
					description: "Decay / feedback"
				}
			]
		},
		Fdn: {
			name: "Fdn",
			description: "Feedback delay network reverb (8-line Hadamard, modulated)",
			category: "effects",
			parameters: [
				{
					name: "input",
					description: "Input signal"
				},
				{
					name: "room",
					default: .5,
					min: .05,
					max: 1,
					unit: "normal",
					description: "Room size"
				},
				{
					name: "damping",
					default: .5,
					min: 0,
					max: 1,
					unit: "normal",
					description: "High-frequency damping"
				},
				{
					name: "decay",
					default: .5,
					min: 0,
					max: 1,
					unit: "normal",
					description: "Decay / feedback"
				},
				{
					name: "depth",
					default: .5,
					min: 0,
					max: 1,
					unit: "normal",
					description: "Delay modulation depth"
				}
			]
		},
		Pink: {
			name: "Pink",
			description: "1/f pink noise (Voss-McCartney 8 rows)",
			category: "generators",
			parameters: [{
				name: "seed",
				default: 0,
				description: "Seed"
			}, {
				name: "trig",
				description: "Trigger resets"
			}]
		},
		Dattorro: {
			name: "Dattorro",
			description: "Dattorro-style stereo reverb (modulated tank)",
			category: "effects",
			parameters: [
				{
					name: "input",
					description: "Input signal"
				},
				{
					name: "room",
					default: .5,
					min: 0,
					max: 1,
					unit: "normal",
					description: "Room size / decay"
				},
				{
					name: "damping",
					default: .5,
					min: 0,
					max: 1,
					unit: "normal",
					description: "High-frequency damping"
				},
				{
					name: "bandwidth",
					default: .5,
					min: 0,
					max: 1,
					unit: "normal",
					description: "Input bandwidth"
				},
				{
					name: "indiff1",
					default: .75,
					min: 0,
					max: 1,
					unit: "normal",
					description: "Input diffusion 1"
				},
				{
					name: "indiff2",
					default: .625,
					min: 0,
					max: 1,
					unit: "normal",
					description: "Input diffusion 2"
				},
				{
					name: "decdiff1",
					default: .7,
					min: 0,
					max: 1,
					unit: "normal",
					description: "Decay diffusion 1"
				},
				{
					name: "decdiff2",
					default: .5,
					min: 0,
					max: 1,
					unit: "normal",
					description: "Decay diffusion 2"
				},
				{
					name: "excrate",
					default: .5,
					min: 0,
					max: 1,
					unit: "normal",
					description: "Modulation rate"
				},
				{
					name: "excdepth",
					default: .5,
					min: 0,
					max: 1,
					unit: "normal",
					description: "Modulation depth"
				},
				{
					name: "predelay",
					default: 0,
					min: 0,
					max: 1,
					unit: "s",
					description: "Pre-delay"
				}
			]
		},
		Random: {
			name: "Random",
			description: "Deterministic uniform [0,1] per sample from seed",
			category: "math",
			parameters: [{
				name: "seed",
				default: 0,
				description: "Seed"
			}]
		},
		Slew: {
			name: "Slew",
			description: "Slew rate limiter with separate rise/fall and curve",
			category: "utilities",
			parameters: [
				{
					name: "input",
					description: "Input signal"
				},
				{
					name: "up",
					default: .5,
					min: 0,
					max: 1,
					description: "Rise coefficient (0=slow, 1=instant)"
				},
				{
					name: "down",
					default: .5,
					min: 0,
					max: 1,
					description: "Fall coefficient (0=slow, 1=instant); ≤0 uses up"
				},
				{
					name: "exp",
					default: 1,
					description: "Curve exponent (0=linear, >0=power, <0=mirrored)"
				}
			]
		},
		Inc: {
			name: "Inc",
			description: "Ramp from offset to ceil at hz rate, trigger reset",
			category: "generators",
			parameters: [
				{
					name: "hz",
					default: 1,
					min: 0,
					unit: "hz",
					description: "Rate"
				},
				{
					name: "ceil",
					default: 1,
					min: 0,
					description: "Ceiling value"
				},
				{
					name: "offset",
					default: 0,
					min: 0,
					description: "Value on trigger"
				},
				{
					name: "trig",
					description: "Trigger impulse"
				}
			]
		},
		Biquadshelf: {
			name: "Biquadshelf",
			description: "Biquad shelf and peak filters (gain-based)",
			category: "filters",
			variants: {
				ls: "Low shelf (Biquad)",
				hs: "High shelf (Biquad)",
				peak: "Peak (notch) (Biquad)"
			},
			parameters: [
				{
					name: "input",
					description: "Input signal"
				},
				{
					name: "cutoff",
					default: 1e3,
					min: 20,
					max: 2e4,
					unit: "hz",
					description: "Cutoff frequency"
				},
				{
					name: "q",
					default: .70710678,
					min: .01,
					max: 20,
					description: "Q factor (peak only)"
				},
				{
					name: "gain",
					default: 0,
					min: -40,
					max: 40,
					unit: "dB",
					description: "Gain in dB"
				}
			]
		},
		Sampler: {
			name: "Sampler",
			description: "Sample player",
			category: "samplers",
			parameters: [
				{
					name: "sample",
					description: "Sample handle from freesound() or record()"
				},
				{
					name: "speed",
					default: 1,
					description: "Playback speed (negative for reverse)"
				},
				{
					name: "offset",
					default: 0,
					min: 0,
					max: 1,
					description: "Normalized start offset"
				},
				{
					name: "repeat",
					default: 0,
					description: "Loop sample when > 0"
				},
				{
					name: "trig",
					description: "Trigger to restart playback"
				}
			]
		},
		Moog: {
			name: "Moog",
			description: "Moog ladder filter (4-pole, nonlinear)",
			category: "filters",
			variants: {
				lpm: "Lowpass filter (Moog)",
				hpm: "Highpass filter (Moog)"
			},
			parameters: [
				{
					name: "input",
					description: "Input signal"
				},
				{
					name: "cutoff",
					default: 1e3,
					min: 50,
					max: 22040,
					unit: "hz",
					description: "Cutoff frequency"
				},
				{
					name: "q",
					default: .70710678,
					min: .01,
					max: .985,
					description: "Q factor"
				}
			]
		},
		Svf: {
			name: "Svf",
			description: "State variable filter (SVF)",
			category: "filters",
			variants: {
				lps: "Lowpass filter (SVF)",
				hps: "Highpass filter (SVF)",
				bps: "Bandpass filter (SVF)",
				bss: "Bandstop filter (SVF)",
				peaks: "Peak (notch) filter (SVF)",
				aps: "Allpass filter (SVF)"
			},
			parameters: [
				{
					name: "input",
					description: "Input signal"
				},
				{
					name: "cutoff",
					default: 1e3,
					min: 50,
					max: 2e4,
					unit: "hz",
					description: "Cutoff frequency"
				},
				{
					name: "q",
					default: .70710678,
					min: .01,
					max: .985,
					description: "Q factor"
				}
			]
		}
	};
	let Y = (H$1, A) => 0 != (H$1 & A), r = (H$1) => {
		let E$1 = new Uint8Array(H$1.length);
		return H$1.split("").forEach((H$2, A) => {
			E$1[A] = H$2.charCodeAt(0);
		}), E$1;
	}, t = (H$1) => {
		var A = new Uint8Array(4);
		return A[0] = H$1, A[1] = H$1 >> 8, A[2] = H$1 >> 16, A[3] = H$1 >> 24, A;
	}, O = (H$1) => {
		var A = new Uint8Array(2);
		return A[0] = H$1, A[1] = H$1 >> 8, A;
	}, I = null, R = (H$1) => {
		let A = new Uint8Array(44 + H$1.length), E$1 = 0, e$1 = (H$2) => {
			A.set(H$2, E$1), E$1 += H$2.length;
		};
		return e$1(r("RIFF")), e$1(t(H$1.length + 12 + 16 + 8 - 8)), e$1(r("WAVE")), e$1(r("fmt ")), e$1(t(16)), e$1(O(1)), e$1(O(1)), e$1(t(22050)), e$1(t(22050)), e$1(O(1)), e$1(O(8)), e$1(r("data")), e$1(t(H$1.length)), e$1(H$1), A;
	}, l = {
		" ": 0,
		"!": 2,
		"\"": 2,
		"#": 2,
		$: 2,
		"%": 2,
		"&": 2,
		"'": 130,
		"(": 0,
		")": 0,
		"*": 2,
		"+": 2,
		",": 2,
		"-": 2,
		".": 2,
		"/": 2,
		0: 3,
		1: 3,
		2: 3,
		3: 3,
		4: 3,
		5: 3,
		6: 3,
		7: 3,
		8: 3,
		9: 3,
		":": 2,
		";": 2,
		"<": 2,
		"=": 2,
		">": 2,
		"?": 2,
		"@": 2,
		A: 192,
		B: 168,
		C: 176,
		D: 172,
		E: 192,
		F: 160,
		G: 184,
		H: 160,
		I: 192,
		J: 188,
		K: 160,
		L: 172,
		M: 168,
		N: 172,
		O: 192,
		P: 160,
		Q: 160,
		R: 172,
		S: 180,
		T: 164,
		U: 192,
		V: 168,
		W: 168,
		X: 176,
		Y: 192,
		Z: 188,
		"[": 0,
		"\\": 0,
		"]": 0,
		"^": 2,
		_: 0,
		"`": 32
	}, U = 128, n = (H$1, A) => 0 != (l[H$1] & A), N = (H$1, A, E$1) => n(H$1[A], E$1), W = (H$1, A) => -1 !== A.indexOf(H$1), E = (H$1) => {
		let A = H$1.split("="), e$1 = A.pop(), E$1 = A.join("=").split("("), r$1 = E$1.pop().split(")"), t$1 = E$1[0], O$1 = r$1[0], R$1 = r$1[1], I$1 = [
			"T",
			"C",
			"S"
		], Y$1 = [
			"E",
			"I",
			"Y"
		], l$1 = (H$2, A$1, E$2) => {
			if (H$2.startsWith(O$1, A$1) && ((A$2, E$3) => {
				for (let H$3 = t$1.length - 1; -1 < H$3; H$3--) {
					var e$2 = t$1[H$3];
					if (n(e$2, U)) {
						if (A$2[--E$3] !== e$2) return !1;
					} else if (!{
						" ": () => !N(A$2, --E$3, U),
						"#": () => N(A$2, --E$3, 64),
						".": () => N(A$2, --E$3, 8),
						"&": () => N(A$2, --E$3, 16) || W(A$2.substr(--E$3, 2), ["CH", "SH"]),
						"@": () => {
							var H$4;
							return !!N(A$2, --E$3, 4) || "H" === (H$4 = A$2[E$3]) && !!W(H$4, I$1);
						},
						"^": () => N(A$2, --E$3, 32),
						"+": () => W(A$2[--E$3], Y$1),
						":": () => {
							for (; 0 <= E$3 && N(A$2, E$3 - 1, 32);) E$3--;
							return !0;
						}
					}[e$2]()) return !1;
				}
				return !0;
			})(H$2, A$1) && ((A$2, E$3) => {
				for (let H$3 = 0; H$3 < R$1.length; H$3++) {
					var e$2 = R$1[H$3];
					if (n(e$2, U)) {
						if (A$2[++E$3] !== e$2) return !1;
					} else if (!{
						" ": () => !N(A$2, ++E$3, U),
						"#": () => N(A$2, ++E$3, 64),
						".": () => N(A$2, ++E$3, 8),
						"&": () => N(A$2, ++E$3, 16) || W(A$2.substr(++E$3 - 2, 2), ["HC", "HS"]),
						"@": () => {
							var H$4;
							return !!N(A$2, ++E$3, 4) || "H" === (H$4 = A$2[E$3]) && !!W(H$4, I$1);
						},
						"^": () => N(A$2, ++E$3, 32),
						"+": () => W(A$2[++E$3], Y$1),
						":": () => {
							for (; N(A$2, E$3 + 1, 32);) E$3++;
							return !0;
						},
						"%": () => {
							if ("E" !== A$2[E$3 + 1]) return "ING" === A$2.substr(E$3 + 1, 3) && (E$3 += 3, !0);
							if (N(A$2, E$3 + 2, U)) {
								if (!W(A$2[E$3 + 2], [
									"R",
									"S",
									"D"
								])) return "L" !== A$2[E$3 + 2] ? "FUL" === A$2.substr(E$3 + 2, 3) && (E$3 += 4, !0) : "Y" === A$2[E$3 + 3] && (E$3 += 3, !0);
								E$3 += 2;
							} else E$3++;
							return !0;
						}
					}[e$2]()) return !1;
				}
				return !0;
			})(H$2, A$1 + (O$1.length - 1))) return E$2(e$1, O$1.length), !0;
		};
		return l$1.c = O$1[0], l$1;
	}, S = {}, T = (" (A.)=EH4Y. |(A) =AH| (ARE) =AAR| (AR)O=AXR|(AR)#=EH4R| ^(AS)#=EY4S|(A)WA=AX|(AW)=AO5| :(ANY)=EH4NIY|(A)^+#=EY5|#:(ALLY)=ULIY| (AL)#=UL|(AGAIN)=AXGEH4N|#:(AG)E=IHJ|(A)^%=EY|(A)^+:#=AE| :(A)^+ =EY4| (ARR)=AXR|(ARR)=AE4R| ^(AR) =AA5R|(AR)=AA5R|(AIR)=EH4R|(AI)=EY4|(AY)=EY5|(AU)=AO4|#:(AL) =UL|#:(ALS) =ULZ|(ALK)=AO4K|(AL)^=AOL| :(ABLE)=EY4BUL|(ABLE)=AXBUL|(A)VO=EY4|(ANG)+=EY4NJ|(ATARI)=AHTAA4RIY|(A)TOM=AE|(A)TTI=AE| (AT) =AET| (A)T=AH|(A)=AE| (B) =BIY4| (BE)^#=BIH|(BEING)=BIY4IHNX| (BOTH) =BOW4TH| (BUS)#=BIH4Z|(BREAK)=BREY5K|(BUIL)=BIH4L|(B)=B| (C) =SIY4| (CH)^=K|^E(CH)=K|(CHA)R#=KEH5|(CH)=CH| S(CI)#=SAY4|(CI)A=SH|(CI)O=SH|(CI)EN=SH|(CITY)=SIHTIY|(C)+=S|(CK)=K|(COMMODORE)=KAA4MAHDOHR|(COM)=KAHM|(CUIT)=KIHT|(CREA)=KRIYEY|(C)=K| (D) =DIY4| (DR.) =DAA4KTER|#:(DED) =DIHD|.E(D) =D|#:^E(D) =T| (DE)^#=DIH| (DO) =DUW| (DOES)=DAHZ|(DONE) =DAH5N|(DOING)=DUW4IHNX| (DOW)=DAW|#(DU)A=JUW|#(DU)^#=JAX|(D)=D| (E) =IYIY4|#:(E) =|':^(E) =| :(E) =IY|#(ED) =D|#:(E)D =|(EV)ER=EH4V|(E)^%=IY4|(ERI)#=IY4RIY|(ERI)=EH4RIH|#:(ER)#=ER|(ERROR)=EH4ROHR|(ERASE)=IHREY5S|(ER)#=EHR|(ER)=ER| (EVEN)=IYVEHN|#:(E)W=|@(EW)=UW|(EW)=YUW|(E)O=IY|#:&(ES) =IHZ|#:(E)S =|#:(ELY) =LIY|#:(EMENT)=MEHNT|(EFUL)=FUHL|(EE)=IY4|(EARN)=ER5N| (EAR)^=ER5|(EAD)=EHD|#:(EA) =IYAX|(EA)SU=EH5|(EA)=IY5|(EIGH)=EY4|(EI)=IY4| (EYE)=AY4|(EY)=IY|(EU)=YUW5|(EQUAL)=IY4KWUL|(E)=EH| (F) =EH4F|(FUL)=FUHL|(FRIEND)=FREH5ND|(FATHER)=FAA4DHER|(F)F=|(F)=F| (G) =JIY4|(GIV)=GIH5V| (G)I^=G|(GE)T=GEH5|SU(GGES)=GJEH4S|(GG)=G| B#(G)=G|(G)+=J|(GREAT)=GREY4T|(GON)E=GAO5N|#(GH)=| (GN)=N|(G)=G| (H) =EY4CH| (HAV)=/HAE6V| (HERE)=/HIYR| (HOUR)=AW5ER|(HOW)=/HAW|(H)#=/H|(H)=| (IN)=IHN| (I) =AY4|(I) =AY|(IN)D=AY5N|SEM(I)=IY| ANT(I)=AY|(IER)=IYER|#:R(IED) =IYD|(IED) =AY5D|(IEN)=IYEHN|(IE)T=AY4EH|(I')=AY5| :(I)^%=AY5| :(IE) =AY4|(I)%=IY|(IE)=IY4| (IDEA)=AYDIY5AH|(I)^+:#=IH|(IR)#=AYR|(IZ)%=AYZ|(IS)%=AYZ|I^(I)^#=IH|+^(I)^+=AY|#:^(I)^+=IH|(I)^+=AY|(IR)=ER|(IGH)=AY4|(ILD)=AY5LD| (IGN)=IHGN|(IGN) =AY4N|(IGN)^=AY4N|(IGN)%=AY4N|(ICRO)=AY4KROH|(IQUE)=IY4K|(I)=IH| (J) =JEY4|(J)=J| (K) =KEY4| (K)N=|(K)=K| (L) =EH4L|(LO)C#=LOW|L(L)=|#:^(L)%=UL|(LEAD)=LIYD| (LAUGH)=LAE4F|(L)=L| (M) =EH4M| (MR.) =MIH4STER| (MS.)=MIH5Z| (MRS.) =MIH4SIXZ|(MOV)=MUW4V|(MACHIN)=MAHSHIY5N|M(M)=|(M)=M| (N) =EH4N|E(NG)+=NJ|(NG)R=NXG|(NG)#=NXG|(NGL)%=NXGUL|(NG)=NX|(NK)=NXK| (NOW) =NAW4|N(N)=|(NON)E=NAH4N|(N)=N| (O) =OH4W|(OF) =AHV| (OH) =OW5|(OROUGH)=ER4OW|#:(OR) =ER|#:(ORS) =ERZ|(OR)=AOR| (ONE)=WAHN|#(ONE) =WAHN|(OW)=OW| (OVER)=OW5VER|PR(O)V=UW4|(OV)=AH4V|(O)^%=OW5|(O)^EN=OW|(O)^I#=OW5|(OL)D=OW4L|(OUGHT)=AO5T|(OUGH)=AH5F| (OU)=AW|H(OU)S#=AW4|(OUS)=AXS|(OUR)=OHR|(OULD)=UH5D|(OU)^L=AH5|(OUP)=UW5P|(OU)=AW|(OY)=OY|(OING)=OW4IHNX|(OI)=OY5|(OOR)=OH5R|(OOK)=UH5K|F(OOD)=UW5D|L(OOD)=AH5D|M(OOD)=UW5D|(OOD)=UH5D|F(OOT)=UH5T|(OO)=UW5|(O')=OH|(O)E=OW|(O) =OW|(OA)=OW4| (ONLY)=OW4NLIY| (ONCE)=WAH4NS|(ON'T)=OW4NT|C(O)N=AA|(O)NG=AO| :^(O)N=AH|I(ON)=UN|#:(ON)=UN|#^(ON)=UN|(O)ST=OW|(OF)^=AO4F|(OTHER)=AH5DHER|R(O)B=RAA|^R(O):#=OW5|(OSS) =AO5S|#:^(OM)=AHM|(O)=AA| (P) =PIY4|(PH)=F|(PEOPL)=PIY5PUL|(POW)=PAW4|(PUT) =PUHT|(P)P=|(P)S=|(P)N=|(PROF.)=PROHFEH4SER|(P)=P| (Q) =KYUW4|(QUAR)=KWOH5R|(QU)=KW|(Q)=K| (R) =AA5R| (RE)^#=RIY|(R)R=|(R)=R| (S) =EH4S|(SH)=SH|#(SION)=ZHUN|(SOME)=SAHM|#(SUR)#=ZHER|(SUR)#=SHER|#(SU)#=ZHUW|#(SSU)#=SHUW|#(SED)=ZD|#(S)#=Z|(SAID)=SEHD|^(SION)=SHUN|(S)S=|.(S) =Z|#:.E(S) =Z|#:^#(S) =S|U(S) =S| :#(S) =Z|##(S) =Z| (SCH)=SK|(S)C+=|#(SM)=ZUM|#(SN)'=ZUM|(STLE)=SUL|(S)=S| (T) =TIY4| (THE) #=DHIY| (THE) =DHAX|(TO) =TUX| (THAT)=DHAET| (THIS) =DHIHS| (THEY)=DHEY| (THERE)=DHEHR|(THER)=DHER|(THEIR)=DHEHR| (THAN) =DHAEN| (THEM) =DHAEN|(THESE) =DHIYZ| (THEN)=DHEHN|(THROUGH)=THRUW4|(THOSE)=DHOHZ|(THOUGH) =DHOW|(TODAY)=TUXDEY|(TOMO)RROW=TUMAA5|(TO)TAL=TOW5| (THUS)=DHAH4S|(TH)=TH|#:(TED)=TIXD|S(TI)#N=CH|(TI)O=SH|(TI)A=SH|(TIEN)=SHUN|(TUR)#=CHER|(TU)A=CHUW| (TWO)=TUW|&(T)EN =|(T)=T| (U) =YUW4| (UN)I=YUWN| (UN)=AHN| (UPON)=AXPAON|@(UR)#=UH4R|(UR)#=YUH4R|(UR)=ER|(U)^ =AH|(U)^^=AH5|(UY)=AY5| G(U)#=|G(U)%=|G(U)#=W|#N(U)=YUW|@(U)=UW|(U)=YUW| (V) =VIY4|(VIEW)=VYUW5|(V)=V| (W) =DAH4BULYUW| (WERE)=WER|(WA)SH=WAA|(WA)ST=WEY|(WA)S=WAH|(WA)T=WAA|(WHERE)=WHEHR|(WHAT)=WHAHT|(WHOL)=/HOWL|(WHO)=/HUW|(WH)=WH|(WAR)#=WEHR|(WAR)=WAOR|(WOR)^=WER|(WR)=R|(WOM)A=WUHM|(WOM)E=WIHM|(WEA)R=WEH|(WANT)=WAA5NT|ANS(WER)=ER|(W)=W| (X) =EH4KR| (X)=Z|(X)=KS| (Y) =WAY4|(YOUNG)=YAHNX| (YOUR)=YOHR| (YOU)=YUW| (YES)=YEHS| (Y)=Y|F(Y)=AY|PS(YCH)=AYK|#:^(Y)=IY|#:^(Y)I=IY| :(Y) =AY| :(Y)#=AY| :(Y)^+:#=IH| :(Y)^#=AY|(Y)=IH| (Z) =ZIY4|(Z)=Z".split("|").map((H$1) => {
		var A = (H$1 = E(H$1)).c;
		S[A] = S[A] || [], S[A].push(H$1);
	}), "(A)=|(!)=.|(\") =-AH5NKWOWT-|(\")=KWOW4T-|(#)= NAH4MBER|($)= DAA4LER|(%)= PERSEH4NT|(&)= AEND|(')=|(*)= AE4STERIHSK|(+)= PLAH4S|(,)=,| (-) =-|(-)=|(.)= POYNT|(/)= SLAE4SH|(0)= ZIY4ROW| (1ST)=FER4ST| (10TH)=TEH4NTH|(1)= WAH4N| (2ND)=SEH4KUND|(2)= TUW4| (3RD)=THER4D|(3)= THRIY4|(4)= FOH4R| (5TH)=FIH4FTH|(5)= FAY4V| (64) =SIH4KSTIY FOHR|(6)= SIH4KS|(7)= SEH4VUN| (8TH)=EY4TH|(8)= EY4T|(9)= NAY4N|(:)=.|(;)=.|(<)= LEH4S DHAEN|(=)= IY4KWULZ|(>)= GREY4TER DHAEN|(?)=?|(@)= AE6T|(^)= KAE4RIXT".split("|").map(E)), f = "*12345678".split(""), e = " *.*?*,*-*IYIHEHAEAAAHAOUHAXIXERUXOHRXLXWXYXWHR*L*W*Y*M*N*NXDXQ*S*SHF*TH/H/XZ*ZHV*DHCH**J*******EYAYOYAWOWUWB*****D*****G*****GX****P*****T*****K*****KX****ULUMUN".match(/.{1,2}/g), D = [
		32768,
		49408,
		49408,
		49408,
		49408,
		164,
		164,
		164,
		164,
		164,
		164,
		132,
		132,
		164,
		164,
		132,
		132,
		132,
		132,
		132,
		132,
		132,
		68,
		4164,
		4164,
		4164,
		4164,
		2124,
		3148,
		2124,
		1096,
		16460,
		9280,
		8256,
		8256,
		9280,
		64,
		64,
		9284,
		8260,
		8260,
		9284,
		8264,
		8256,
		76,
		8260,
		0,
		0,
		180,
		180,
		180,
		148,
		148,
		148,
		78,
		78,
		78,
		1102,
		1102,
		1102,
		78,
		78,
		78,
		78,
		78,
		78,
		75,
		75,
		75,
		1099,
		1099,
		1099,
		75,
		75,
		75,
		75,
		75,
		75,
		128,
		193,
		193
	], i = [
		0,
		4626,
		4626,
		4626,
		2056,
		2824,
		2312,
		2824,
		3592,
		3851,
		2822,
		4108,
		3082,
		1541,
		1541,
		3595,
		3082,
		3594,
		3082,
		2825,
		2056,
		2055,
		2825,
		2567,
		2310,
		2056,
		2054,
		2055,
		2055,
		2055,
		770,
		1285,
		514,
		514,
		514,
		514,
		514,
		514,
		1542,
		1542,
		2055,
		1542,
		1542,
		514,
		2312,
		1027,
		513,
		286,
		3597,
		3852,
		3852,
		3852,
		3598,
		3593,
		2054,
		513,
		514,
		1797,
		513,
		257,
		1798,
		513,
		514,
		1798,
		513,
		514,
		2056,
		514,
		514,
		1540,
		514,
		514,
		1798,
		513,
		1028,
		1798,
		257,
		1028,
		1479,
		1535
	], g = (A, E$1) => {
		var H$1 = e.findIndex((H$2) => H$2 === A + E$1 && "*" !== H$2[1]);
		return -1 !== H$1 && H$1;
	}, B = (A) => {
		var H$1 = e.findIndex((H$2) => H$2 === A + "*");
		return -1 !== H$1 && H$1;
	}, p = (r$1, t$1, O$1) => {
		for (let e$1 = 0; e$1 < r$1.length; e$1++) {
			let H$1 = r$1[e$1], A = r$1[e$1 + 1] || "", E$1;
			if (!1 !== (E$1 = g(H$1, A))) e$1++, t$1(E$1);
			else if (!1 !== (E$1 = B(H$1))) t$1(E$1);
			else {
				for (E$1 = f.length; H$1 !== f[E$1] && 0 < E$1;) --E$1;
				if (0 === E$1) throw Error();
				O$1(E$1);
			}
		}
	}, o = (H$1, A) => Y(D[H$1], A), V = 23, b = 57, w = 69, m = 1, J = 2, y = 8192, k = 4096, Q = 2048, x = 1024, j = 256, a = 128, u = 64, L = 32, $ = 16, _ = 8, s = 4, G = 2, h = 1, q = (E$1, e$1, r$1, t$1) => {
		let H$1 = (H$2, A$1) => {
			switch (H$2) {
				case 53:
					o(r$1(A$1 - 1), x) && e$1(A$1, 16);
					break;
				case 42:
					E$1(A$1 + 1, 43, t$1(A$1));
					break;
				case 44: E$1(A$1 + 1, 45, t$1(A$1));
			}
		}, A = (H$2, A$1) => {
			e$1(H$2, 13), E$1(H$2 + 1, A$1, t$1(H$2));
		}, O$1 = -1, R$1;
		for (; null !== (R$1 = r$1(++O$1));) if (0 !== R$1) if (o(R$1, $)) E$1(O$1 + 1, o(R$1, L) ? 21 : 20, t$1(O$1)), H$1(R$1, O$1);
		else if (78 === R$1) A(O$1, 24);
		else if (79 === R$1) A(O$1, 27);
		else if (80 === R$1) A(O$1, 28);
		else if (o(R$1, a) && t$1(O$1)) 0 === r$1(O$1 + 1) && null !== (R$1 = r$1(O$1 + 2)) && o(R$1, a) && t$1(O$1 + 2) && E$1(O$1 + 2, 31, 0);
		else {
			var I$1, Y$1 = 0 === O$1 ? null : r$1(O$1 - 1);
			if (R$1 === V) switch (Y$1) {
				case w:
					e$1(O$1 - 1, 42);
					break;
				case b:
					e$1(O$1 - 1, 44);
					break;
				default: o(Y$1, a) && e$1(O$1, 18);
			}
			else 24 === R$1 && o(Y$1, a) ? e$1(O$1, 19) : 60 === Y$1 && 32 === R$1 ? e$1(O$1, 38) : 60 === R$1 ? (I$1 = r$1(O$1 + 1), o(I$1, L) || null === I$1 || e$1(O$1, 63)) : (72 === R$1 && (I$1 = r$1(O$1 + 1), o(I$1, L) && null !== I$1 || (e$1(O$1, 75), R$1 = 75)), o(R$1, h) && 32 === Y$1 ? e$1(O$1, R$1 - 12) : o(R$1, h) || H$1(R$1, O$1), 69 !== R$1 && 57 !== R$1 || 0 < O$1 && o(r$1(O$1 - 1), a) && (0 === (R$1 = r$1(O$1 + 1)) && (R$1 = r$1(O$1 + 2)), o(R$1, a)) && !t$1(O$1 + 1) && e$1(O$1, 30));
		}
	}, z = (r$1, t$1, O$1) => {
		for (let H$1 = 0; null !== r$1(H$1); H$1++) if (o(r$1(H$1), j)) {
			for (var A, E$1 = H$1; 1 < --H$1 && !o(r$1(H$1), a););
			if (0 === H$1) break;
			for (; H$1 < E$1; H$1++) o(r$1(H$1), y) && !o(r$1(H$1), s) || (A = O$1(H$1), t$1(H$1, (A >> 1) + A + 1));
		}
		let R$1 = -1, I$1;
		for (; null !== (I$1 = r$1(++R$1));) {
			let H$1 = R$1, A$1, E$2, e$1;
			if (o(I$1, a)) I$1 = r$1(++H$1), o(I$1, u) ? (A$1 = null === I$1 ? u | h : D[I$1], Y(A$1, s) ? (e$1 = O$1(R$1), t$1(R$1, (e$1 >> 2) + e$1 + 1)) : Y(A$1, h) && (E$2 = O$1(R$1), t$1(R$1, E$2 - (E$2 >> 3)))) : 18 !== I$1 && 19 !== I$1 || !o(r$1(++H$1), u) || t$1(R$1, O$1(R$1) - 1);
			else if (o(I$1, Q)) null !== (I$1 = r$1(++H$1)) && o(I$1, G) && (t$1(H$1, 6), t$1(H$1 - 1, 5));
			else if (o(I$1, G)) {
				for (; 0 === (I$1 = r$1(++H$1)););
				null !== I$1 && o(I$1, G) && (t$1(H$1, 1 + (O$1(H$1) >> 1)), t$1(R$1, 1 + (O$1(R$1) >> 1)));
			} else 0 < H$1 && o(I$1, k) && o(r$1(H$1 - 1), G) && t$1(H$1, O$1(H$1) - 2);
		}
	}, H1 = (H$1, A, E$1) => {
		let e$1 = 0;
		for (var r$1; null !== (r$1 = H$1(e$1));) o(r$1, u) && null !== (r$1 = H$1(e$1 + 1)) && o(r$1, a) && 0 !== (r$1 = A(e$1 + 1)) && r$1 < 128 && E$1(e$1, r$1 + 1), ++e$1;
	}, A1 = (H$1, A, E$1) => {
		let e$1 = 0;
		for (var r$1; null !== (r$1 = H$1(e$1));) {
			var t$1 = A(e$1);
			E$1(e$1, 0 === t$1 || 127 < t$1 ? 255 & i[r$1] : i[r$1] >> 8), e$1++;
		}
	}, E1 = (E$1, H$1, A) => {
		let e$1 = -1;
		for (var r$1; null !== (r$1 = E$1(++e$1));) if (o(r$1, G)) {
			if (o(r$1, h)) {
				let H$2, A$1 = e$1;
				for (; 0 === (H$2 = E$1(++A$1)););
				if (null !== H$2 && (o(H$2, _) || 36 === H$2 || 37 === H$2)) continue;
			}
			H$1(e$1 + 1, r$1 + 1, A(e$1), 255 & i[r$1 + 1]), H$1(e$1 + 2, r$1 + 2, A(e$1), 255 & i[r$1 + 2]), e$1 += 2;
		}
	}, e1 = [
		24,
		26,
		23,
		23,
		23
	], r1 = [
		0,
		224,
		230,
		236,
		243,
		249,
		0,
		6,
		12,
		6
	], M = [
		0,
		31,
		31,
		31,
		31,
		2,
		2,
		2,
		2,
		2,
		2,
		2,
		2,
		2,
		5,
		5,
		2,
		10,
		2,
		8,
		5,
		5,
		11,
		10,
		9,
		8,
		8,
		160,
		8,
		8,
		23,
		31,
		18,
		18,
		18,
		18,
		30,
		30,
		20,
		20,
		20,
		20,
		23,
		23,
		26,
		26,
		29,
		29,
		2,
		2,
		2,
		2,
		2,
		2,
		26,
		29,
		27,
		26,
		29,
		27,
		26,
		29,
		27,
		26,
		29,
		27,
		23,
		29,
		23,
		23,
		29,
		23,
		23,
		29,
		23,
		23,
		29,
		23,
		23,
		23
	], K = [
		0,
		2,
		2,
		2,
		2,
		4,
		4,
		4,
		4,
		4,
		4,
		4,
		4,
		4,
		4,
		4,
		4,
		4,
		3,
		2,
		4,
		4,
		2,
		2,
		2,
		2,
		2,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		2,
		2,
		2,
		1,
		0,
		1,
		0,
		1,
		0,
		5,
		5,
		5,
		5,
		5,
		4,
		4,
		2,
		0,
		1,
		2,
		0,
		1,
		2,
		0,
		1,
		2,
		0,
		1,
		2,
		0,
		2,
		2,
		0,
		1,
		3,
		0,
		2,
		3,
		0,
		2,
		160,
		160
	], C = [
		0,
		2,
		2,
		2,
		2,
		4,
		4,
		4,
		4,
		4,
		4,
		4,
		4,
		4,
		4,
		4,
		4,
		4,
		3,
		3,
		4,
		4,
		3,
		3,
		3,
		3,
		3,
		1,
		2,
		3,
		2,
		1,
		3,
		3,
		3,
		3,
		1,
		1,
		3,
		3,
		3,
		2,
		2,
		3,
		2,
		3,
		0,
		0,
		5,
		5,
		5,
		5,
		4,
		4,
		2,
		0,
		2,
		2,
		0,
		3,
		2,
		0,
		4,
		2,
		0,
		3,
		2,
		0,
		2,
		2,
		0,
		2,
		3,
		0,
		3,
		3,
		0,
		3,
		176,
		160
	], t1 = [
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		241,
		226,
		211,
		187,
		124,
		149,
		1,
		2,
		3,
		3,
		0,
		114,
		0,
		2,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		27,
		0,
		0,
		25,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0
	], O1 = [
		0,
		5980947,
		5980947,
		5980947,
		5980947,
		7230474,
		6113550,
		5980947,
		5783320,
		5842971,
		5712919,
		5775125,
		5383440,
		5844244,
		6113550,
		4075794,
		5383182,
		5774866,
		4076306,
		7218448,
		5250317,
		6112527,
		5904395,
		3944978,
		7216654,
		5904395,
		7230217,
		5320198,
		7943686,
		6641158,
		7943686,
		5980945,
		6506758,
		6967046,
		5315078,
		7946758,
		6113550,
		5383440,
		6107913,
		6767114,
		4990984,
		6106890,
		6639366,
		6639366,
		7946758,
		6639365,
		7958022,
		0,
		5916691,
		5777179,
		5775125,
		5778203,
		5774866,
		5382669,
		5315078,
		5315078,
		5315078,
		7946758,
		7946758,
		7946758,
		7368198,
		7237126,
		7237126,
		6181894,
		6181894,
		6181894,
		5315078,
		5315078,
		5315078,
		7946758,
		7946758,
		7946758,
		6647046,
		6641162,
		7367946,
		6181894,
		6181894,
		6181894,
		556844,
		98067
	], v = [
		0,
		0,
		0,
		0,
		0,
		526861,
		461581,
		527630,
		527887,
		68879,
		68623,
		3087,
		68367,
		2316,
		461581,
		330508,
		68623,
		3087,
		396301,
		67597,
		2061,
		461838,
		2061,
		330252,
		67597,
		2061,
		526861,
		780,
		2313,
		198153,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		779,
		66827,
		779,
		1035,
		0,
		0,
		1,
		66827,
		920064,
		66050,
		593422,
		68879,
		3087,
		68879,
		3087,
		2061,
		2,
		260,
		0,
		2,
		260,
		0,
		1,
		260,
		0,
		1,
		260,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		461324,
		0,
		0,
		330240,
		0,
		1245199,
		1048591
	], R1 = [
		56,
		132,
		107,
		25,
		198,
		99,
		24,
		134,
		115,
		152,
		198,
		177,
		28,
		202,
		49,
		140,
		199,
		49,
		136,
		194,
		48,
		152,
		70,
		49,
		24,
		198,
		53,
		12,
		202,
		49,
		12,
		198,
		33,
		16,
		36,
		105,
		18,
		194,
		49,
		20,
		196,
		113,
		8,
		74,
		34,
		73,
		171,
		106,
		168,
		172,
		73,
		81,
		50,
		213,
		82,
		136,
		147,
		108,
		148,
		34,
		21,
		84,
		210,
		37,
		150,
		212,
		80,
		165,
		70,
		33,
		8,
		133,
		107,
		24,
		196,
		99,
		16,
		206,
		107,
		24,
		140,
		113,
		25,
		140,
		99,
		53,
		12,
		198,
		51,
		153,
		204,
		108,
		181,
		78,
		162,
		153,
		70,
		33,
		40,
		130,
		149,
		46,
		227,
		48,
		156,
		197,
		48,
		156,
		162,
		177,
		156,
		103,
		49,
		136,
		102,
		89,
		44,
		83,
		24,
		132,
		103,
		80,
		202,
		227,
		10,
		172,
		171,
		48,
		172,
		98,
		48,
		140,
		99,
		16,
		148,
		98,
		177,
		140,
		130,
		40,
		150,
		51,
		152,
		214,
		181,
		76,
		98,
		41,
		165,
		74,
		181,
		156,
		198,
		49,
		20,
		214,
		56,
		156,
		75,
		180,
		134,
		101,
		24,
		174,
		103,
		28,
		166,
		99,
		25,
		150,
		35,
		25,
		132,
		19,
		8,
		166,
		82,
		172,
		202,
		34,
		137,
		110,
		171,
		25,
		140,
		98,
		52,
		196,
		98,
		25,
		134,
		99,
		24,
		196,
		35,
		88,
		214,
		163,
		80,
		66,
		84,
		74,
		173,
		74,
		37,
		17,
		107,
		100,
		137,
		74,
		99,
		57,
		138,
		35,
		49,
		42,
		234,
		162,
		169,
		68,
		197,
		18,
		205,
		66,
		52,
		140,
		98,
		24,
		140,
		99,
		17,
		72,
		102,
		49,
		157,
		68,
		51,
		29,
		70,
		49,
		156,
		198,
		177,
		12,
		205,
		50,
		136,
		196,
		115,
		24,
		134,
		115,
		8,
		214,
		99,
		88,
		7,
		129,
		224,
		240,
		60,
		7,
		135,
		144,
		60,
		124,
		15,
		199,
		192,
		192,
		240,
		124,
		30,
		7,
		128,
		128,
		0,
		28,
		120,
		112,
		241,
		199,
		31,
		192,
		12,
		254,
		28,
		31,
		31,
		14,
		10,
		122,
		192,
		113,
		242,
		131,
		143,
		3,
		15,
		15,
		12,
		0,
		121,
		248,
		97,
		224,
		67,
		15,
		131,
		231,
		24,
		249,
		193,
		19,
		218,
		233,
		99,
		143,
		15,
		131,
		131,
		135,
		195,
		31,
		60,
		112,
		240,
		225,
		225,
		227,
		135,
		184,
		113,
		14,
		32,
		227,
		141,
		72,
		120,
		28,
		147,
		135,
		48,
		225,
		193,
		193,
		228,
		120,
		33,
		131,
		131,
		195,
		135,
		6,
		57,
		229,
		195,
		135,
		7,
		14,
		28,
		28,
		112,
		244,
		113,
		156,
		96,
		54,
		50,
		195,
		30,
		60,
		243,
		143,
		14,
		60,
		112,
		227,
		199,
		143,
		15,
		15,
		14,
		60,
		120,
		240,
		227,
		135,
		6,
		240,
		227,
		7,
		193,
		153,
		135,
		15,
		24,
		120,
		112,
		112,
		252,
		243,
		16,
		177,
		140,
		140,
		49,
		124,
		112,
		225,
		134,
		60,
		100,
		108,
		176,
		225,
		227,
		15,
		35,
		143,
		15,
		30,
		62,
		56,
		60,
		56,
		123,
		143,
		7,
		14,
		60,
		244,
		23,
		30,
		60,
		120,
		242,
		158,
		114,
		73,
		227,
		37,
		54,
		56,
		88,
		57,
		226,
		222,
		60,
		120,
		120,
		225,
		199,
		97,
		225,
		225,
		176,
		240,
		240,
		195,
		199,
		14,
		56,
		192,
		240,
		206,
		115,
		115,
		24,
		52,
		176,
		225,
		199,
		142,
		28,
		60,
		248,
		56,
		240,
		225,
		193,
		139,
		134,
		143,
		28,
		120,
		112,
		240,
		120,
		172,
		177,
		143,
		57,
		49,
		219,
		56,
		97,
		195,
		14,
		14,
		56,
		120,
		115,
		23,
		30,
		57,
		30,
		56,
		100,
		225,
		241,
		193,
		78,
		15,
		64,
		162,
		2,
		197,
		143,
		129,
		161,
		252,
		18,
		8,
		100,
		224,
		60,
		34,
		224,
		69,
		7,
		142,
		12,
		50,
		144,
		240,
		31,
		32,
		73,
		224,
		248,
		12,
		96,
		240,
		23,
		26,
		65,
		170,
		164,
		208,
		141,
		18,
		130,
		30,
		30,
		3,
		248,
		62,
		3,
		12,
		115,
		128,
		112,
		68,
		38,
		3,
		36,
		225,
		62,
		4,
		78,
		4,
		28,
		193,
		9,
		204,
		158,
		144,
		33,
		7,
		144,
		67,
		100,
		192,
		15,
		198,
		144,
		156,
		193,
		91,
		3,
		226,
		29,
		129,
		224,
		94,
		29,
		3,
		132,
		184,
		44,
		15,
		128,
		177,
		131,
		224,
		48,
		65,
		30,
		67,
		137,
		131,
		80,
		252,
		36,
		46,
		19,
		131,
		241,
		124,
		76,
		44,
		201,
		13,
		131,
		176,
		181,
		130,
		228,
		232,
		6,
		156,
		7,
		160,
		153,
		29,
		7,
		62,
		130,
		143,
		112,
		48,
		116,
		64,
		202,
		16,
		228,
		232,
		15,
		146,
		20,
		63,
		6,
		248,
		132,
		136,
		67,
		129,
		10,
		52,
		57,
		65,
		198,
		227,
		28,
		71,
		3,
		176,
		184,
		19,
		10,
		194,
		100,
		248,
		24,
		249,
		96,
		179,
		192,
		101,
		32,
		96,
		166,
		140,
		195,
		129,
		32,
		48,
		38,
		30,
		28,
		56,
		211,
		1,
		176,
		38,
		64,
		244,
		11,
		195,
		66,
		31,
		133,
		50,
		38,
		96,
		64,
		201,
		203,
		1,
		236,
		17,
		40,
		64,
		250,
		4,
		52,
		224,
		112,
		76,
		140,
		29,
		7,
		105,
		3,
		22,
		200,
		4,
		35,
		232,
		198,
		154,
		11,
		26,
		3,
		224,
		118,
		6,
		5,
		207,
		30,
		188,
		88,
		49,
		113,
		102,
		0,
		248,
		63,
		4,
		252,
		12,
		116,
		39,
		138,
		128,
		113,
		194,
		58,
		38,
		6,
		192,
		31,
		5,
		15,
		152,
		64,
		174,
		1,
		127,
		192,
		7,
		255,
		0,
		14,
		254,
		0,
		3,
		223,
		128,
		3,
		239,
		128,
		27,
		241,
		194,
		0,
		231,
		224,
		24,
		252,
		224,
		33,
		252,
		128,
		60,
		252,
		64,
		14,
		126,
		0,
		63,
		62,
		0,
		15,
		254,
		0,
		31,
		255,
		0,
		62,
		240,
		7,
		252,
		0,
		126,
		16,
		63,
		255,
		0,
		63,
		56,
		14,
		124,
		1,
		135,
		12,
		252,
		199,
		0,
		62,
		4,
		15,
		62,
		31,
		15,
		15,
		31,
		15,
		2,
		131,
		135,
		207,
		3,
		135,
		15,
		63,
		192,
		7,
		158,
		96,
		63,
		192,
		3,
		254,
		0,
		63,
		224,
		119,
		225,
		192,
		254,
		224,
		195,
		224,
		1,
		223,
		248,
		3,
		7,
		0,
		126,
		112,
		0,
		124,
		56,
		24,
		254,
		12,
		30,
		120,
		28,
		124,
		62,
		14,
		31,
		30,
		30,
		62,
		0,
		127,
		131,
		7,
		219,
		135,
		131,
		7,
		199,
		7,
		16,
		113,
		255,
		0,
		63,
		226,
		1,
		224,
		193,
		195,
		225,
		0,
		127,
		192,
		5,
		240,
		32,
		248,
		240,
		112,
		254,
		120,
		121,
		248,
		2,
		63,
		12,
		143,
		3,
		15,
		159,
		224,
		193,
		199,
		135,
		3,
		195,
		195,
		176,
		225,
		225,
		193,
		227,
		224,
		113,
		240,
		0,
		252,
		112,
		124,
		12,
		62,
		56,
		14,
		28,
		112,
		195,
		199,
		3,
		129,
		193,
		199,
		231,
		0,
		15,
		199,
		135,
		25,
		9,
		239,
		196,
		51,
		224,
		193,
		252,
		248,
		112,
		240,
		120,
		248,
		240,
		97,
		199,
		0,
		31,
		248,
		1,
		124,
		248,
		240,
		120,
		112,
		60,
		124,
		206,
		14,
		33,
		131,
		207,
		8,
		7,
		143,
		8,
		193,
		135,
		143,
		128,
		199,
		227,
		0,
		7,
		248,
		224,
		239,
		0,
		57,
		247,
		128,
		14,
		248,
		225,
		227,
		248,
		33,
		159,
		192,
		255,
		3,
		248,
		7,
		192,
		31,
		248,
		196,
		4,
		252,
		196,
		193,
		188,
		135,
		240,
		15,
		192,
		127,
		5,
		224,
		37,
		236,
		192,
		62,
		132,
		71,
		240,
		142,
		3,
		248,
		3,
		251,
		192,
		25,
		248,
		7,
		156,
		12,
		23,
		248,
		7,
		224,
		31,
		161,
		252,
		15,
		252,
		1,
		240,
		63,
		0,
		254,
		3,
		240,
		31,
		0,
		253,
		0,
		255,
		136,
		13,
		249,
		1,
		255,
		0,
		112,
		7,
		192,
		62,
		66,
		243,
		13,
		196,
		127,
		128,
		252,
		7,
		240,
		94,
		192,
		63,
		0,
		120,
		63,
		129,
		255,
		1,
		248,
		1,
		195,
		232,
		12,
		228,
		100,
		143,
		228,
		15,
		240,
		7,
		240,
		194,
		31,
		0,
		127,
		192,
		111,
		128,
		126,
		3,
		248,
		7,
		240,
		63,
		192,
		120,
		15,
		130,
		7,
		254,
		34,
		119,
		112,
		2,
		118,
		3,
		254,
		0,
		254,
		103,
		0,
		124,
		199,
		241,
		142,
		198,
		59,
		224,
		63,
		132,
		243,
		25,
		216,
		3,
		153,
		252,
		9,
		184,
		15,
		248,
		0,
		157,
		36,
		97,
		249,
		13,
		0,
		253,
		3,
		240,
		31,
		144,
		63,
		1,
		248,
		31,
		208,
		15,
		248,
		55,
		1,
		248,
		7,
		240,
		15,
		192,
		63,
		0,
		254,
		3,
		248,
		15,
		192,
		63,
		0,
		250,
		3,
		240,
		15,
		128,
		255,
		1,
		184,
		7,
		240,
		1,
		252,
		1,
		188,
		128,
		19,
		30,
		0,
		127,
		225,
		64,
		127,
		160,
		127,
		176,
		0,
		63,
		192,
		31,
		192,
		56,
		15,
		240,
		31,
		128,
		255,
		1,
		252,
		3,
		241,
		126,
		1,
		254,
		1,
		240,
		255,
		0,
		127,
		192,
		29,
		7,
		240,
		15,
		192,
		126,
		6,
		224,
		7,
		224,
		15,
		248,
		6,
		193,
		254,
		1,
		252,
		3,
		224,
		15,
		0,
		252
	], I1 = (A, E$1) => {
		let e$1 = (H$1, A$1) => (H$1 * A$1 >> 8 & 255) << 1, r$1 = [
			[],
			[],
			[]
		];
		O1.map((H$1, A$1) => {
			r$1[0][A$1] = 255 & H$1, r$1[1][A$1] = H$1 >> 8 & 255, r$1[2][A$1] = H$1 >> 16 & 255;
		});
		for (let H$1 = 5; H$1 < 30; H$1++) r$1[0][H$1] = e$1(A, r$1[0][H$1]), r$1[1][H$1] = e$1(E$1, r$1[1][H$1]);
		for (let H$1 = 48; H$1 < 54; H$1++) r$1[0][H$1] = e$1(A, r$1[0][H$1]), r$1[1][H$1] = e$1(E$1, r$1[1][H$1]);
		return r$1;
	}, Y1 = (A, H$1, E$1, e$1) => {
		let Y$1 = [
			A,
			H$1[0],
			H$1[1],
			H$1[2],
			E$1[0],
			E$1[1],
			E$1[2]
		], l$1 = (H$2, A$1) => Y$1[H$2][A$1], r$1 = (A$1, E$2, e$2, H$2) => {
			let r$2 = H$2 < 0, t$2 = Math.abs(H$2) % A$1, O$2 = H$2 / A$1 | 0, R$2 = 0, I$2 = A$1;
			for (; 0 < --I$2;) {
				let H$3 = l$1(E$2, e$2) + O$2;
				(R$2 += t$2) >= A$1 && (R$2 -= A$1, r$2 ? H$3-- : H$3 && H$3++), Y$1[E$2][++e$2] = H$3, H$3 += O$2;
			}
		}, t$1, O$1, R$1 = 0;
		for (let H$2 = 0; H$2 < e$1.length - 1; H$2++) {
			var I$1 = e$1[H$2][0], U$1 = e$1[H$2 + 1][0], n$1 = M[U$1], N$1 = M[I$1], W$1 = (O$1 = N$1 === n$1 ? (t$1 = K[I$1], K[U$1]) : N$1 < n$1 ? (t$1 = C[U$1], K[U$1]) : (t$1 = K[I$1], C[I$1]), (R$1 += e$1[H$2][1]) + O$1), S$1 = R$1 - t$1, T$1 = t$1 + O$1;
			if (0 == (T$1 - 2 & 128)) {
				r$1((N$1 = e$1[H$2][1] >> 1) + (n$1 = e$1[H$2 + 1][1] >> 1), 0, S$1, A[R$1 + n$1] - A[R$1 - N$1]);
				for (let H$3 = 1; H$3 < 7; H$3++) {
					var f$1 = l$1(H$3, W$1) - l$1(H$3, S$1);
					r$1(T$1, H$3, S$1, f$1);
				}
			}
		}
		return R$1 + e$1[e$1.length - 1][1];
	}, l1 = 255, U1 = 1, n1 = (E$1, e$1, r$1) => {
		let H$1 = (H$2, A, E$2) => {
			var e$2 = A;
			A < 30 ? A = 0 : A -= 30;
			let r$2;
			for (; 127 === (r$2 = E$2[A]);) ++A;
			for (; A !== e$2;) for (r$2 += H$2, E$2[A] = 255 & r$2; ++A !== e$2 && 255 === E$2[A];);
		}, t$1 = [], O$1 = [
			[],
			[],
			[]
		], R$1 = [
			[],
			[],
			[]
		], I$1 = [], Y$1 = 0;
		for (let A = 0; A < e$1.length; A++) {
			var l$1 = e$1[A][0], U$1 = (l$1 === m ? H$1(U1, Y$1, t$1) : l$1 === J && H$1(l1, Y$1, t$1), r1[e$1[A][2]]);
			for (let H$2 = e$1[A][1]; 0 < H$2; H$2--) O$1[0][Y$1] = r$1[0][l$1], O$1[1][Y$1] = r$1[1][l$1], O$1[2][Y$1] = r$1[2][l$1], R$1[0][Y$1] = 255 & v[l$1], R$1[1][Y$1] = v[l$1] >> 8 & 255, R$1[2][Y$1] = v[l$1] >> 16 & 255, I$1[Y$1] = t1[l$1], t$1[Y$1] = E$1 + U$1 & 255, Y$1++;
		}
		return [
			t$1,
			O$1,
			R$1,
			I$1
		];
	}, N1 = (H$1, A, E$1, e$1, r$1) => {
		var E$1 = I1(E$1, e$1), [t$1, O$1, R$1, e$1] = n1(A, H$1, E$1), A = Y1(t$1, O$1, R$1, H$1);
		if (!r$1) for (let H$2 = 0; H$2 < t$1.length; H$2++) t$1[H$2] -= O$1[0][H$2] >> 1;
		var I$1 = [
			0,
			1,
			2,
			2,
			2,
			3,
			3,
			4,
			4,
			5,
			6,
			8,
			9,
			11,
			13,
			15
		];
		for (let H$2 = R$1[0].length - 1; 0 <= H$2; H$2--) R$1[0][H$2] = I$1[R$1[0][H$2]], R$1[1][H$2] = I$1[R$1[1][H$2]], R$1[2][H$2] = I$1[R$1[2][H$2]];
		return [
			A,
			O$1,
			t$1,
			R$1,
			e$1
		];
	}, W1 = (H$1) => {
		let E$1 = new Uint8Array(H$1), e$1 = 0, r$1 = 0, t$1 = (H$2, A) => {
			A = 16 * (15 & A), t$1.ary(H$2, [
				A,
				A,
				A,
				A,
				A
			]);
		};
		return t$1.ary = (H$2, A) => {
			if (((e$1 += [
				[
					162,
					167,
					167,
					127,
					128
				],
				[
					226,
					60,
					60,
					0,
					0
				],
				[
					225,
					60,
					59,
					0,
					0
				],
				[
					200,
					0,
					0,
					54,
					55
				],
				[
					199,
					0,
					0,
					54,
					54
				]
			][r$1][H$2]) / 50 | 0) > E$1.length) throw new Error();
			r$1 = H$2;
			for (let H$3 = 0; H$3 < 5; H$3++) E$1[(e$1 / 50 | 0) + H$3] = A[H$3];
		}, t$1.get = () => E$1.slice(0, e$1 / 50 | 0), t$1;
	}, X = (O$1, A, H$1, E$1) => {
		let e$1 = (7 & H$1) - 1, R$1 = 256 * e$1 & 65535, I$1 = 248 & H$1, r$1 = (H$2, A$1, E$2, e$2) => {
			let r$2 = 8, t$2 = R1[R$1 + I$1];
			for (; 0 != (128 & t$2) ? O$1(H$2, A$1) : O$1(E$2, e$2), t$2 <<= 1, --r$2;);
		};
		if (0 === I$1) {
			let H$2 = E$1 >> 4 ^ 255;
			for (I$1 = 255 & A; r$1(3, 26, 4, 6), I$1++, I$1 &= 255, 255 & ++H$2;);
			return I$1;
		}
		I$1 ^= 255;
		for (var t$1 = 255 & e1[e$1]; r$1(2, 5, 1, t$1), 255 & ++I$1;);
		return A;
	}, c = (H$1) => 127 * Math.sin(2 * Math.PI * (H$1 / 256)) | 0, S1 = (H$1, A, E$1, t$1, e$1, O$1, r$1) => {
		let R$1 = E$1, I$1 = 0, Y$1 = 0, l$1 = 0, U$1 = 0, n$1 = 0, N$1 = e$1[0], W$1 = .75 * N$1 | 0;
		for (; A;) {
			var S$1 = r$1[n$1];
			if (0 != (248 & S$1)) U$1 = X(H$1, U$1, S$1, e$1[255 & n$1]), n$1 += 2, A -= 2, R$1 = E$1;
			else {
				{
					let A$1 = [], E$2 = 256 * I$1, e$2 = 256 * Y$1, r$2 = 256 * l$1;
					for (let H$2 = 0; H$2 < 5; H$2++) {
						var T$1 = c(255 & E$2 >> 8), f$1 = c(255 & e$2 >> 8), D$1 = (255 & r$2 >> 8) < 129 ? -112 : 112, T$1 = (T$1 * (15 & O$1[0][n$1]) + f$1 * (15 & O$1[1][n$1]) + D$1 * (15 & O$1[2][n$1])) / 32 + 128;
						A$1[H$2] = 0 | T$1, E$2 += 256 * t$1[0][n$1] / 4, e$2 += 256 * t$1[1][n$1] / 4, r$2 += 256 * t$1[2][n$1] / 4;
					}
					H$1.ary(0, A$1);
				}
				if (0 == --R$1) {
					if (n$1++, 0 == --A) return;
					R$1 = E$1;
				}
				if (0 != --N$1) {
					if (0 != --W$1 || 0 === S$1) {
						I$1 += t$1[0][n$1], Y$1 += t$1[1][n$1], l$1 += t$1[2][n$1];
						continue;
					}
					U$1 = X(H$1, U$1, S$1, e$1[255 & n$1]);
				}
			}
			N$1 = e$1[n$1], W$1 = .75 * N$1 | 0, I$1 = 0, Y$1 = 0, l$1 = 0;
		}
	};
	function d(H$1) {
		var A, E$1, e$1, r$1, t$1, O$1 = 1 < arguments.length && void 0 !== arguments[1] ? arguments[1] : {}, H$1 = ((H$2) => {
			if (!H$2) return !1;
			let A$1 = (H$3) => H$3 === I$1.length ? null : I$1[H$3], E$2 = (A$2, H$3, E$3, e$3) => {
				for (let H$4 = I$1.length - 1; H$4 >= A$2; H$4--) I$1[H$4 + 1] = I$1[H$4], R$1[H$4 + 1] = t$2(H$4), O$2[H$4 + 1] = r$2(H$4);
				I$1[A$2] = H$3, R$1[A$2] = 0 | e$3, O$2[A$2] = E$3;
			}, r$2 = (H$3) => 0 | O$2[H$3], t$2 = (H$3) => 0 | R$1[H$3], e$2 = (H$3, A$2) => {
				R$1[H$3] = A$2;
			}, O$2 = [], R$1 = [], I$1 = [], Y$1 = 0;
			return p(H$2, (H$3) => {
				O$2[Y$1] = 0, R$1[Y$1] = 0, I$1[Y$1++] = H$3;
			}, (H$3) => {
				O$2[Y$1 - 1] = H$3;
			}), q(E$2, (H$3, A$2) => {
				I$1[H$3] = A$2;
			}, A$1, r$2), H1(A$1, r$2, (H$3, A$2) => {
				O$2[H$3] = A$2;
			}), A1(A$1, r$2, e$2), z(A$1, e$2, t$2), E1(A$1, E$2, r$2), I$1.map((H$3, A$2) => H$3 ? [
				H$3,
				0 | R$1[A$2],
				0 | O$2[A$2]
			] : null).filter((H$3) => H$3);
		})(H$1);
		return !1 !== H$1 && (r$1 = void 0 === (r$1 = O$1.pitch) ? 64 : 255 & r$1, E$1 = void 0 === (E$1 = O$1.mouth) ? 128 : 255 & E$1, e$1 = void 0 === (e$1 = O$1.throat) ? 128 : 255 & e$1, A = 255 & (O$1.speed || 72), O$1 = O$1.singmode || !1, r$1 = N1(H$1, r$1, E$1, e$1, O$1), E$1 = W1(176.4 * H$1.reduce((H$2, A$1) => H$2 + A$1[1], 0) * A | 0), [e$1, O$1, H$1, r$1, t$1] = r$1, S1(E$1, e$1, A, O$1, H$1, r$1, t$1), E$1.get());
	}
	let F = (H$1) => {
		let A = " " + H$1.toUpperCase(), E$1 = 0, e$1 = "", r$1 = (H$2, A$1) => {
			E$1 += A$1, e$1 += H$2;
		}, t$1 = 0;
		for (; E$1 < A.length && t$1++ < 1e4;) {
			var O$1 = A[E$1];
			if ("." !== O$1 || N(A, E$1 + 1, 1)) if (n(O$1, 2)) T.some((H$2) => H$2(A, E$1, r$1));
			else if (0 !== l[O$1]) {
				if (!n(O$1, U)) return !1;
				S[O$1].some((H$2) => H$2(A, E$1, r$1));
			} else e$1 += " ", E$1++;
			else e$1 += ".", E$1++;
		}
		return e$1;
	}, Z = d, P = (H$1, A) => {
		if (!1 === (H$1 = d(H$1, A))) return !1;
		var E$1 = H$1, e$1 = new Float32Array(E$1.length);
		for (let H$2 = 0; H$2 < E$1.length; H$2++) e$1[H$2] = (E$1[H$2] - 128) / 256;
		return e$1;
	};
	function H(H$1) {
		let E$1 = H$1 || {}, e$1 = (H$2, A) => A || E$1.phonetic ? H$2.toUpperCase() : F(H$2);
		this.buf8 = (H$2, A) => Z(e$1(H$2, A), E$1), this.buf32 = (H$2, A) => P(e$1(H$2, A), E$1), this.speak = (A, H$2) => {
			if (A = this.buf32(A, H$2), I = null === I ? new AudioContext() : I) {
				var O$1 = I, R$1 = A;
				let t$1, H$3 = new Promise((H$4, A$1) => {
					let E$2 = O$1.createBufferSource(), e$2 = O$1.createBuffer(1, R$1.length, 22050), r$1 = e$2.getChannelData(0);
					for (let H$5 = 0; H$5 < R$1.length; H$5++) r$1[H$5] = R$1[H$5];
					E$2.buffer = e$2, E$2.connect(O$1.destination), E$2.onended = () => {
						H$4(!0);
					}, t$1 = (H$5) => {
						E$2.disconnect(), A$1(H$5);
					}, E$2.start(0);
				});
				return H$3.abort = t$1, H$3;
			}
			throw new Error();
		}, this.download = (H$2, A) => {
			var E$2, H$2 = this.buf8(H$2, A), A = new Blob([R(H$2)], { type: "audio/vnd.wave" }), A = (H$2 = window.URL || window.webkitURL).createObjectURL(A);
			(E$2 = document.createElement("a")).href = A, E$2.target = "_blank", E$2.download = "sam.wav", document.body.appendChild(E$2), E$2.click(), document.body.removeChild(E$2), H$2.revokeObjectURL(A);
		}, this.wav = (H$2, A) => R(this.buf8(H$2, A));
	}
	H.buf8 = Z, H.buf32 = P, H.convert = F;
	function parseChordSuffix(suffix) {
		const tones = [];
		const omit = /* @__PURE__ */ new Set();
		let hasSus2 = false;
		let hasSus4 = false;
		let i$1 = 0;
		while (i$1 < suffix.length) {
			const extMatch = suffix.slice(i$1).match(/^([b#]?)(\d+)/);
			if (extMatch) {
				const acc = extMatch[1];
				const num = parseInt(extMatch[2], 10);
				i$1 += extMatch[0].length;
				let degree;
				let adjust = 0;
				if (num === 7) {
					degree = 6;
					adjust = acc === "b" ? -1 : acc === "#" ? 1 : 0;
				} else if (num === 9) {
					degree = 8;
					adjust = acc === "b" ? -1 : acc === "#" ? 1 : 0;
				} else if (num === 11) {
					degree = 10;
					adjust = acc === "b" ? -1 : acc === "#" ? 1 : 0;
				} else if (num === 13) {
					degree = 12;
					adjust = acc === "b" ? -1 : acc === "#" ? 1 : 0;
				} else if (num === 5) {
					degree = 4;
					adjust = acc === "b" ? -1 : acc === "#" ? 1 : 0;
				} else continue;
				tones.push({
					degree,
					semitoneAdjust: adjust
				});
				continue;
			}
			if (suffix.slice(i$1).startsWith("sus4")) {
				hasSus4 = true;
				i$1 += 4;
				continue;
			}
			if (suffix.slice(i$1).startsWith("sus2")) {
				hasSus2 = true;
				i$1 += 4;
				continue;
			}
			if (suffix.slice(i$1).startsWith("sus")) {
				hasSus4 = true;
				i$1 += 3;
				continue;
			}
			const noMatch = suffix.slice(i$1).match(/^no(\d+)/);
			if (noMatch) {
				const num = parseInt(noMatch[1], 10);
				i$1 += noMatch[0].length;
				if (num === 3) omit.add(2);
				else if (num === 5) omit.add(4);
				continue;
			}
			const addMatch = suffix.slice(i$1).match(/^add(\d+)/);
			if (addMatch) {
				const num = parseInt(addMatch[1], 10);
				i$1 += addMatch[0].length;
				if (num === 2) tones.push({
					degree: 1,
					semitoneAdjust: 0
				});
				else if (num === 4) tones.push({
					degree: 3,
					semitoneAdjust: 0
				});
				else if (num === 6) tones.push({
					degree: 5,
					semitoneAdjust: 0
				});
				continue;
			}
			if (suffix.slice(i$1).startsWith("o7")) {
				tones.push({
					degree: 0,
					semitoneAdjust: 0
				});
				tones.push({
					degree: 2,
					semitoneAdjust: -1
				});
				tones.push({
					degree: 4,
					semitoneAdjust: -1
				});
				tones.push({
					degree: 6,
					semitoneAdjust: -2
				});
				return tones;
			}
			i$1++;
		}
		const result = [];
		result.push({
			degree: 0,
			semitoneAdjust: 0
		});
		if (hasSus2) result.push({
			degree: 1,
			semitoneAdjust: 0
		});
		else if (hasSus4) result.push({
			degree: 3,
			semitoneAdjust: 0
		});
		else if (!omit.has(2)) result.push({
			degree: 2,
			semitoneAdjust: 0
		});
		if (!omit.has(4)) {
			const alteredFifth = tones.find((t$1) => t$1.degree === 4);
			if (alteredFifth) result.push(alteredFifth);
			else result.push({
				degree: 4,
				semitoneAdjust: 0
			});
		}
		for (const tone of tones) if (tone.degree >= 5 && !result.some((r$1) => r$1.degree === tone.degree)) result.push(tone);
		for (const tone of tones) if (tone.degree < 5 && tone.degree !== 0 && tone.degree !== 2 && tone.degree !== 4) {
			if (!result.some((r$1) => r$1.degree === tone.degree)) result.push(tone);
		}
		return result;
	}
	function romanToDegree(text) {
		const t$1 = text.toLowerCase();
		if (t$1 === "i") return 1;
		if (t$1 === "ii") return 2;
		if (t$1 === "iii") return 3;
		if (t$1 === "iv") return 4;
		if (t$1 === "v") return 5;
		if (t$1 === "vi") return 6;
		if (t$1 === "vii") return 7;
		return null;
	}
	const SCALE_INTERVALS = {
		major: [
			0,
			2,
			4,
			5,
			7,
			9,
			11
		],
		minor: [
			0,
			2,
			3,
			5,
			7,
			8,
			10
		],
		pentatonic: [
			0,
			3,
			5,
			7,
			10
		],
		pent: [
			0,
			3,
			5,
			7,
			10
		],
		minorpentatonic: [
			0,
			3,
			5,
			7,
			10
		],
		minorpent: [
			0,
			3,
			5,
			7,
			10
		],
		majorpentatonic: [
			0,
			2,
			4,
			7,
			9
		],
		majorpent: [
			0,
			2,
			4,
			7,
			9
		],
		ritusen: [
			0,
			2,
			4,
			6,
			9
		],
		kumai: [
			0,
			2,
			3,
			7,
			9
		],
		hirajoshi: [
			0,
			2,
			3,
			7,
			8
		],
		iwato: [
			0,
			1,
			5,
			6,
			10
		],
		chinese: [
			0,
			4,
			6,
			7,
			11
		],
		indian: [
			0,
			4,
			5,
			7,
			9,
			11
		],
		pelog: [
			0,
			1,
			3,
			7,
			8
		],
		prometheus: [
			0,
			2,
			4,
			6,
			9,
			10
		],
		scriabin: [
			0,
			1,
			4,
			7,
			9
		],
		gong: [
			0,
			2,
			4,
			7,
			9
		],
		shang: [
			0,
			2,
			5,
			7,
			10
		],
		jiao: [
			0,
			3,
			5,
			8,
			10
		],
		zhi: [
			0,
			2,
			4,
			6,
			9
		],
		yu: [
			0,
			3,
			5,
			7,
			9
		],
		whole: [
			0,
			2,
			4,
			6,
			8,
			10
		],
		wholetone: [
			0,
			2,
			4,
			6,
			8,
			10
		],
		augmented: [
			0,
			3,
			4,
			7,
			8,
			11
		],
		augmented2: [
			0,
			1,
			4,
			5,
			8,
			9
		],
		hexmajor7: [
			0,
			2,
			4,
			7,
			9,
			11
		],
		hexdorian: [
			0,
			2,
			3,
			5,
			7,
			9
		],
		hexphrygian: [
			0,
			1,
			4,
			5,
			7,
			10
		],
		hexsus: [
			0,
			2,
			5,
			7,
			9,
			10
		],
		hexmajor6: [
			0,
			2,
			4,
			5,
			7,
			9
		],
		hexaeolian: [
			0,
			2,
			3,
			5,
			7,
			8
		],
		ionian: [
			0,
			2,
			4,
			5,
			7,
			9,
			11
		],
		dorian: [
			0,
			2,
			3,
			5,
			7,
			9,
			10
		],
		phrygian: [
			0,
			1,
			3,
			5,
			7,
			8,
			10
		],
		lydian: [
			0,
			2,
			4,
			6,
			7,
			9,
			11
		],
		mixolydian: [
			0,
			2,
			4,
			5,
			7,
			9,
			10
		],
		aeolian: [
			0,
			2,
			3,
			5,
			7,
			8,
			10
		],
		locrian: [
			0,
			1,
			3,
			5,
			6,
			8,
			10
		],
		harmonicminor: [
			0,
			2,
			3,
			5,
			7,
			8,
			11
		],
		harmonicmajor: [
			0,
			2,
			4,
			5,
			7,
			8,
			11
		],
		melodicminor: [
			0,
			2,
			3,
			5,
			7,
			9,
			11
		],
		melodicminordesc: [
			0,
			2,
			3,
			5,
			7,
			8,
			10
		],
		melodicmajor: [
			0,
			2,
			4,
			6,
			7,
			9,
			11
		],
		bartok: [
			0,
			2,
			4,
			5,
			7,
			8,
			10
		],
		hindu: [
			0,
			2,
			5,
			7,
			8,
			10
		],
		todi: [
			0,
			1,
			3,
			6,
			7,
			8,
			11
		],
		purvi: [
			0,
			1,
			4,
			6,
			7,
			8,
			11
		],
		marva: [
			0,
			1,
			4,
			6,
			7,
			9,
			11
		],
		bhairav: [
			0,
			1,
			4,
			5,
			7,
			8,
			11
		],
		ahirbhairav: [
			0,
			1,
			4,
			5,
			7,
			9,
			10
		],
		superlocrian: [
			0,
			1,
			3,
			4,
			6,
			8,
			10
		],
		romanianminor: [
			0,
			2,
			3,
			6,
			7,
			9,
			10
		],
		hungarianminor: [
			0,
			2,
			3,
			6,
			7,
			8,
			11
		],
		neapolitanminor: [
			0,
			1,
			3,
			5,
			7,
			8,
			11
		],
		enigmatic: [
			0,
			1,
			4,
			6,
			8,
			10,
			11
		],
		spanish: [
			0,
			1,
			3,
			4,
			5,
			7,
			8,
			10
		],
		leadingwhole: [
			0,
			2,
			4,
			6,
			8,
			9,
			11
		],
		lydianminor: [
			0,
			2,
			4,
			6,
			7,
			8,
			10
		],
		neapolitanmajor: [
			0,
			1,
			3,
			5,
			7,
			9,
			11
		],
		locrianmajor: [
			0,
			2,
			4,
			5,
			6,
			8,
			10
		],
		diminished: [
			0,
			2,
			3,
			5,
			6,
			8,
			9,
			11
		],
		octatonic: [
			0,
			1,
			3,
			4,
			6,
			7,
			9,
			10
		],
		diminished2: [
			0,
			1,
			3,
			4,
			6,
			7,
			9,
			10
		],
		octatonic2: [
			0,
			2,
			3,
			5,
			6,
			8,
			9,
			11
		],
		messiaen1: [
			0,
			2,
			4,
			6,
			8,
			10
		],
		messiaen2: [
			0,
			1,
			2,
			5,
			6,
			7,
			10,
			11
		],
		messiaen3: [
			0,
			2,
			3,
			4,
			6,
			7,
			8,
			11
		],
		messiaen4: [
			0,
			1,
			2,
			5,
			6,
			7,
			9,
			10
		],
		messiaen5: [
			0,
			1,
			5,
			6,
			7,
			11
		],
		messiaen6: [
			0,
			2,
			4,
			5,
			6,
			8,
			10,
			11
		],
		messiaen7: [
			0,
			1,
			2,
			3,
			5,
			6,
			7,
			8,
			9,
			11
		],
		chromatic: [
			0,
			1,
			2,
			3,
			4,
			5,
			6,
			7,
			8,
			9,
			10,
			11
		],
		bayati: [
			0,
			1,
			4,
			5,
			7,
			8,
			10
		],
		hijaz: [
			0,
			1,
			4,
			5,
			7,
			8,
			10
		],
		sikah: [
			0,
			1,
			4,
			5,
			7,
			8,
			10
		],
		rast: [
			0,
			2,
			4,
			5,
			7,
			9,
			10
		],
		saba: [
			0,
			1,
			3,
			4,
			6,
			7,
			9,
			10
		],
		iraq: [
			0,
			1,
			4,
			5,
			7,
			8,
			10
		]
	};
	const SCALE_KEY_TO_INDEX = {};
	{
		const sigToIndex = /* @__PURE__ */ new Map();
		let next = 0;
		for (const [name, intervals] of Object.entries(SCALE_INTERVALS)) {
			const sig = intervals.join(",");
			let idx = sigToIndex.get(sig);
			if (idx === void 0) {
				idx = next++;
				sigToIndex.set(sig, idx);
			}
			SCALE_KEY_TO_INDEX[name] = idx;
		}
	}
	function findScaleIndex(scaleName) {
		if (!scaleName) return void 0;
		const q$1 = scaleName.toLowerCase();
		for (const name of Object.keys(SCALE_INTERVALS)) if (name.startsWith(q$1)) return SCALE_KEY_TO_INDEX[name];
	}
	const SCALE_INDEX_TO_INTERVALS = [];
	{
		const seen = /* @__PURE__ */ new Set();
		for (const [name, intervals] of Object.entries(SCALE_INTERVALS)) {
			const idx = SCALE_KEY_TO_INDEX[name];
			if (idx !== void 0 && !seen.has(idx)) {
				seen.add(idx);
				SCALE_INDEX_TO_INTERVALS[idx] = intervals;
			}
		}
	}
	function getScaleIntervalsByIndex(scaleIndex) {
		return SCALE_INDEX_TO_INTERVALS[scaleIndex];
	}
	function degreeToMidiTs(rootMidi, scaleIndex, degree, semitoneAdjust = 0) {
		const intervals = getScaleIntervalsByIndex(scaleIndex);
		if (!intervals || intervals.length === 0 || degree <= 0) return -1;
		const step = degree - 1;
		const octave = Math.floor(step / intervals.length);
		return rootMidi + (intervals[(step % intervals.length + intervals.length) % intervals.length] + octave * 12 + semitoneAdjust);
	}
	const NOTE_OFFSETS = {
		c: 0,
		d: 2,
		e: 4,
		f: 5,
		g: 7,
		a: 9,
		b: 11
	};
	const NOTE_NAME_PATTERN = /^[a-gA-G][#b]?-?\d+$/;
	function isNoteName(name) {
		return NOTE_NAME_PATTERN.test(name);
	}
	function noteNameToMidi(noteName) {
		const match = noteName.match(/^([a-gA-G])([#b]?)(-?\d+)$/);
		if (!match) throw new Error(`Invalid note name: ${noteName}`);
		const [, note, accidental, octave] = match;
		let midi = NOTE_OFFSETS[note.toLowerCase()] + (parseInt(octave, 10) + 1) * 12;
		if (accidental === "#") midi += 1;
		else if (accidental === "b") midi -= 1;
		return midi;
	}
	function midiToFrequency(midi) {
		return 440 * Math.pow(2, (midi - 69) / 12);
	}
	function compileFunctionBlock(state, block) {
		const stmts = block.body;
		for (let i$1 = 0; i$1 < stmts.length; i$1++) {
			const stmt = stmts[i$1];
			if (i$1 === stmts.length - 1) if (stmt.type === "expr") compileExpr(state, stmt.expr);
			else if (stmt.type === "block") {
				pushScope(state);
				compileFunctionBlock(state, stmt);
				popScope(state);
			} else {
				compileStmt(state, stmt);
				state.ops.push(AudioVmOp.PushScalar);
				state.ops.push(0);
			}
			else if (stmt.type === "expr") {
				compileExpr(state, stmt.expr);
				if (state.stack.length > 0) {
					state.ops.push(AudioVmOp.Pop);
					state.stack.pop();
				}
			} else compileStmt(state, stmt);
		}
		if (stmts.length === 0) {
			state.ops.push(AudioVmOp.PushScalar);
			state.ops.push(0);
		}
	}
	function compileFunction(state, expr, name) {
		const savedFunctionDepth = state.functionDepth;
		state.functionDepth = savedFunctionDepth + 1;
		const functionId = state.nextFunctionId++;
		const params = expr.params;
		const paramCount = params.length;
		const defaults = expr.defaults || [];
		const historyStartIndex = state.historySourceMap.length;
		const savedOps = state.ops;
		const savedStack = state.stack;
		const savedLocals = state.locals;
		const savedNextLocalIndex = state.nextLocalIndex;
		const savedInFunction = state.inFunction;
		const savedClosureVars = state.closureVars;
		const savedParamMap = state.paramNameToLocalIndex;
		if (savedFunctionDepth > 0) state.functionsByNameStack.push(/* @__PURE__ */ new Map());
		const closureVarNames = detectClosureVars(state, expr, state.locals);
		const closureVarInfos = [];
		for (const varName of closureVarNames) {
			if (varName === "$") {
				const outerPipe = state.pipeVars[state.pipeVars.length - 1];
				if (outerPipe) closureVarInfos.push(outerPipe.varInfo);
				continue;
			}
			const varInfo = lookupVariable(state, varName);
			if (varInfo) closureVarInfos.push(varInfo);
		}
		const savedCurrentFunctionId = state.currentFunctionId;
		const isOversampleCallback = state.captureGlobalsInClosures;
		state.currentFunctionId = functionId;
		const bodyOps = [];
		state.ops = bodyOps;
		state.stack = [];
		state.locals = [/* @__PURE__ */ new Map()];
		state.nextLocalIndex = 0;
		state.inFunction = true;
		state.closureVars = [];
		for (let i$1 = 0; i$1 < closureVarNames.length; i$1++) {
			const closureInfo = {
				scope: "closure",
				index: closureVarInfos[i$1].index,
				closureIndex: i$1
			};
			state.locals[0].set(closureVarNames[i$1], closureInfo);
		}
		const destructuredParams = new Array(paramCount);
		const paramNameToLocalIndex = /* @__PURE__ */ new Map();
		for (let i$1 = 0; i$1 < paramCount; i$1++) {
			const param = params[i$1];
			if (param.type === "param-destructure") {
				const tempVarInfo = {
					scope: "local",
					index: state.nextLocalIndex++
				};
				destructuredParams[i$1] = {
					names: param.names,
					tempVar: tempVarInfo
				};
			} else if (param.type === "param-named-destructure") {
				const tempVarInfo = {
					scope: "local",
					index: state.nextLocalIndex++
				};
				destructuredParams[i$1] = {
					names: param.names,
					tempVar: tempVarInfo
				};
				paramNameToLocalIndex.set(param.paramName, tempVarInfo.index);
			} else {
				const paramInfo = {
					scope: "local",
					index: state.nextLocalIndex++
				};
				state.locals[0].set(param.name, paramInfo);
				destructuredParams[i$1] = null;
				paramNameToLocalIndex.set(param.name, i$1);
			}
		}
		state.paramNameToLocalIndex = paramNameToLocalIndex;
		const defaultParamFunctionIds = /* @__PURE__ */ new Map();
		const defaultParamFunctionIdsByName = /* @__PURE__ */ new Map();
		let hasDefaultCalls = false;
		for (let i$1 = 0; i$1 < paramCount; i$1++) {
			const defaultExpr = defaults[i$1];
			if (defaultExpr) {
				if (defaultExpr.type === "call") hasDefaultCalls = true;
				const param = params[i$1];
				const destructInfo = destructuredParams[i$1];
				const paramName = param.type === "param" ? param.name : null;
				const paramInfo = destructInfo ? destructInfo.tempVar : {
					scope: "local",
					index: i$1
				};
				compileGetVariable(state, paramInfo);
				state.stack.push({ expr: defaultExpr });
				state.ops.push(AudioVmOp.IsUndefined);
				state.stack.pop();
				state.stack.push({ expr: defaultExpr });
				state.ops.push(AudioVmOp.JumpIfFalse);
				const jumpToSkipIndex = state.ops.length;
				state.ops.push(0);
				state.stack.pop();
				if (paramName) state.locals[0].delete(paramName);
				if (defaultExpr.type === "fn") {
					const innerId = compileFunction(state, defaultExpr, null);
					defaultParamFunctionIds.set(i$1, innerId);
					if (paramName) defaultParamFunctionIdsByName.set(paramName, innerId);
				} else compileExpr(state, defaultExpr);
				if (paramName) state.locals[0].set(paramName, paramInfo);
				compileSetVariable(state, paramInfo, defaultExpr);
				state.stack.pop();
				const skipTarget = state.ops.length;
				state.ops[jumpToSkipIndex] = skipTarget;
			}
		}
		if (defaultParamFunctionIdsByName.size > 0) state.functionIdToDefaultParamFunctions.set(functionId, defaultParamFunctionIdsByName);
		for (let i$1 = 0; i$1 < paramCount; i$1++) {
			const destructInfo = destructuredParams[i$1];
			if (destructInfo) {
				const { names, tempVar } = destructInfo;
				for (let j$1 = 0; j$1 < names.length; j$1++) {
					const localInfo = {
						scope: "local",
						index: state.nextLocalIndex++
					};
					state.locals[0].set(names[j$1], localInfo);
					compileGetVariable(state, tempVar);
					state.stack.push({ expr: params[i$1] });
					state.ops.push(AudioVmOp.PushScalar);
					state.ops.push(j$1);
					state.stack.push({ expr: params[i$1] });
					state.ops.push(AudioVmOp.ArrayGet, 0);
					state.stack.pop();
					state.stack.pop();
					state.stack.push({ expr: params[i$1] });
					compileSetVariable(state, localInfo, params[i$1]);
					state.stack.pop();
				}
			}
		}
		if (expr.body.type === "block") {
			compileFunctionBlock(state, expr.body);
			state.ops.push(AudioVmOp.Return);
		} else {
			compileExpr(state, expr.body);
			state.ops.push(AudioVmOp.Return);
		}
		const bytecodeLength = bodyOps.length;
		const localCount = state.nextLocalIndex;
		state.functionBytecodes.set(functionId, bodyOps);
		const paramNames = new Array(paramCount);
		const paramTypes = new Array(paramCount);
		let firstParamIn = 0;
		for (let i$1 = 0; i$1 < paramCount; i$1++) {
			const p$1 = params[i$1];
			paramTypes[i$1] = p$1.type;
			if (p$1.type === "param") paramNames[i$1] = p$1.name;
			else if (p$1.type === "param-named-destructure") paramNames[i$1] = p$1.paramName;
			else paramNames[i$1] = p$1.names[0] || "_";
		}
		if (paramCount > 0 && paramNames[0] === "in") {
			if (paramTypes[0] === "param") firstParamIn = 1;
			else if (paramTypes[0] === "param-named-destructure") {
				if (params[0].names.length === 2) firstParamIn = 2;
			}
		}
		const funcInfo = {
			id: functionId,
			paramCount,
			params: paramNames,
			paramTypes,
			firstParamIn,
			bytecodeStart: 0,
			bytecodeLength,
			closureVars: closureVarNames,
			definitionLine: expr.loc.line,
			defaultParamFunctionIds: defaultParamFunctionIds.size > 0 ? defaultParamFunctionIds : void 0,
			defaultParamExprs: hasDefaultCalls ? defaults : void 0
		};
		state.functions.push(funcInfo);
		if (name) {
			funcInfo.isGlobalScope = savedFunctionDepth === 0;
			state.functionsByNameStack[state.functionsByNameStack.length - 1].set(name, funcInfo);
		}
		state.ops = savedOps;
		state.stack = savedStack;
		state.locals = savedLocals;
		state.nextLocalIndex = savedNextLocalIndex;
		state.inFunction = savedInFunction;
		state.closureVars = savedClosureVars;
		state.paramNameToLocalIndex = savedParamMap;
		state.functionDepth = savedFunctionDepth;
		if (savedFunctionDepth > 0) state.functionsByNameStack.pop();
		for (const varInfo of closureVarInfos) {
			compilePushCellRef(state, varInfo, expr);
			state.stack.push({ expr });
		}
		state.ops.push(AudioVmOp.DefineFunction);
		state.ops.push(functionId);
		state.ops.push(paramCount);
		state.ops.push(firstParamIn);
		state.ops.push(closureVarNames.length);
		state.ops.push(localCount);
		state.ops.push(bytecodeLength);
		const functionBytecodeStart = state.ops.length;
		state.functionBytecodeStarts.set(functionId, functionBytecodeStart);
		for (let i$1 = 0; i$1 < bodyOps.length; i$1++) state.ops.push(bodyOps[i$1]);
		const history = state.historySourceMap;
		for (let i$1 = historyStartIndex; i$1 < history.length; i$1++) {
			const entry = history[i$1];
			if (entry.__functionId === functionId) {
				const relativePc = entry.__relativePc;
				if (relativePc !== void 0) {
					entry.pc = functionBytecodeStart + relativePc;
					entry.__finalFunctionId = functionId;
				}
				delete entry.__functionId;
				delete entry.__relativePc;
			}
		}
		let returnIndex;
		let maxPc = -1;
		for (let i$1 = 0; i$1 < state.historySourceMap.length; i$1++) {
			const entry = state.historySourceMap[i$1];
			if (entry.__finalFunctionId === functionId && entry.pc > maxPc) {
				maxPc = entry.pc;
				returnIndex = i$1;
			}
		}
		if (returnIndex !== void 0) funcInfo.returnHistorySourceMapIndex = returnIndex;
		if (isOversampleCallback) state.oversampleCallbackFunctionIds.add(functionId);
		state.currentFunctionId = savedCurrentFunctionId;
		state.stack.push({ expr });
		return functionId;
	}
	const SYSTEM_VARS = new Set([
		"t",
		"samplesPerBeat",
		"samplesPerBar",
		"co",
		"undefined"
	]);
	const PIPE_SCOPE = new Map([["$", true]]);
	const SYSTEM_VAR_NAMES = Array.from(SYSTEM_VARS);
	const COMPOUND_ASSIGN_OP_TO_OPCODE = {
		"+=": AudioVmOp.Add,
		"-=": AudioVmOp.Sub,
		"*=": AudioVmOp.Mul,
		"/=": AudioVmOp.Div,
		"%=": AudioVmOp.Mod,
		"**=": AudioVmOp.Pow,
		"&=": AudioVmOp.BitAnd,
		"|=": AudioVmOp.BitOr,
		"^=": AudioVmOp.BitXor,
		"<<=": AudioVmOp.ShiftLeft,
		">>=": AudioVmOp.ShiftRight
	};
	function getFunctionByName(state, name) {
		for (let i$1 = state.functionsByNameStack.length - 1; i$1 >= 0; i$1--) {
			const info = state.functionsByNameStack[i$1].get(name);
			if (info) return info;
		}
	}
	function hasFunctionByName(state, name) {
		return getFunctionByName(state, name) !== void 0;
	}
	function* functionsByNameEntries(state) {
		const seen = /* @__PURE__ */ new Set();
		for (let i$1 = state.functionsByNameStack.length - 1; i$1 >= 0; i$1--) {
			const map = state.functionsByNameStack[i$1];
			for (const [name, info] of map) if (!seen.has(name)) {
				seen.add(name);
				yield [name, info];
			}
		}
	}
	function hasGlobalFunctionByName(state, name) {
		return state.functionsByNameStack[0]?.has(name) ?? false;
	}
	function lookupVariable(state, name) {
		if (SYSTEM_VARS.has(name)) return {
			scope: "system",
			index: SYSTEM_VAR_NAMES.indexOf(name)
		};
		if (!state.compilingRecordCallback && state.paramNameToLocalIndex?.has(name)) return {
			scope: "local",
			index: state.paramNameToLocalIndex.get(name)
		};
		for (let i$1 = state.locals.length - 1; i$1 >= 0; i$1--) {
			const local = state.locals[i$1].get(name);
			if (local) return local;
		}
		if (state.inFunction) for (let i$1 = state.closureVars.length - 1; i$1 >= 0; i$1--) {
			const closure = state.closureVars[i$1].get(name);
			if (closure) return closure;
		}
		const global = state.globals.get(name);
		if (global) return global;
		if (getFunctionByName(state, name)?.isGlobalScope) {
			const info = {
				scope: "global",
				index: state.nextGlobalIndex++
			};
			state.globals.set(name, info);
			return info;
		}
		return null;
	}
	function declareVariable(state, name, loc, shadow = false) {
		if (SYSTEM_VARS.has(name)) {
			error(state, `Cannot assign to system variable: ${name}`, loc);
			return {
				scope: "system",
				index: 0
			};
		}
		if (shadow) {
			const currentScope$1 = getCurrentScope(state);
			if (currentScope$1) {
				const info$2 = {
					scope: "local",
					index: state.nextLocalIndex++
				};
				currentScope$1.set(name, info$2);
				return info$2;
			}
			const info$1 = {
				scope: "global",
				index: state.nextGlobalIndex++
			};
			state.globals.set(name, info$1);
			return info$1;
		}
		const existing = lookupVariable(state, name);
		if (existing && existing.scope !== "system") return existing;
		const currentScope = getCurrentScope(state);
		if (currentScope) {
			const info$1 = {
				scope: "local",
				index: state.nextLocalIndex++
			};
			currentScope.set(name, info$1);
			return info$1;
		}
		const info = {
			scope: "global",
			index: state.nextGlobalIndex++
		};
		state.globals.set(name, info);
		return info;
	}
	function compilePushCellRef(state, varInfo, expr) {
		switch (varInfo.scope) {
			case "system":
				error(state, "Cannot capture system variable in closure", expr.loc);
				break;
			case "global":
				state.ops.push(AudioVmOp.GetCellRefGlobal);
				state.ops.push(varInfo.index);
				break;
			case "local":
				state.ops.push(AudioVmOp.GetCellRefLocal);
				state.ops.push(varInfo.index);
				break;
			case "closure":
				state.ops.push(AudioVmOp.GetCellRefClosure);
				state.ops.push(varInfo.closureIndex ?? 0);
				break;
		}
	}
	function compileGetVariable(state, varInfo) {
		switch (varInfo.scope) {
			case "system":
				state.ops.push(AudioVmOp.GetSystem);
				state.ops.push(varInfo.index);
				break;
			case "global":
				state.ops.push(AudioVmOp.GetGlobal);
				state.ops.push(varInfo.index);
				break;
			case "local":
				state.ops.push(AudioVmOp.GetLocal);
				state.ops.push(varInfo.index);
				break;
			case "closure":
				state.ops.push(AudioVmOp.GetClosure);
				state.ops.push(varInfo.closureIndex ?? 0);
				break;
		}
	}
	function compileSetVariable(state, varInfo, expr) {
		switch (varInfo.scope) {
			case "system":
				error(state, "Cannot assign to system variable", expr.loc);
				break;
			case "global":
				state.ops.push(AudioVmOp.SetGlobal);
				state.ops.push(varInfo.index);
				break;
			case "local":
				state.ops.push(AudioVmOp.SetLocal);
				state.ops.push(varInfo.index);
				break;
			case "closure":
				state.ops.push(AudioVmOp.SetClosure);
				state.ops.push(varInfo.closureIndex ?? 0);
				break;
		}
	}
	function compileAssign(state, expr) {
		const ops = state.ops;
		const stack = state.stack;
		const { left, right, op } = expr;
		const stackExpr = { expr };
		if (left.type === "destructure") {
			if (op !== "=" && op !== ":=") {
				error(state, "Destructuring assignment only supports = and := operators", expr.loc);
				return;
			}
			compileExpr(state, right);
			if (stack.length === 0) {
				error(state, "Assignment has no value", expr.loc);
				return;
			}
			const shadow = op === ":=";
			const stackRight = { expr: right };
			const names = left.names;
			for (let i$1 = 0; i$1 < names.length; i$1++) {
				const name = names[i$1];
				ops.push(AudioVmOp.Dup);
				stack.push(stackRight);
				ops.push(AudioVmOp.PushScalar, i$1);
				stack.push(stackRight);
				ops.push(AudioVmOp.ArrayGet, 0);
				stack.pop();
				stack.pop();
				stack.push(stackRight);
				compileSetVariable(state, declareVariable(state, name, left.loc, shadow), left);
				stack.pop();
			}
			stack.push(stackExpr);
			return;
		}
		if (left.type !== "identifier" && left.type !== "index") {
			error(state, "Assignment target must be an identifier, array index, or destructuring pattern", expr.loc);
			return;
		}
		if (op === "=>") {
			if (left.type !== "identifier") {
				error(state, "Function definition target must be an identifier", expr.loc);
				return;
			}
			const leftName = left.name;
			if (leftName === "mix") state.mixDefinitionLoc = expr.loc;
			const x$1 = {
				type: "identifier",
				name: "x",
				loc: left.loc
			};
			const fnExpr = {
				type: "fn",
				params: [{
					type: "param",
					name: "x",
					loc: left.loc
				}],
				defaults: [null],
				body: {
					type: "binary",
					op: "|>",
					left: x$1,
					right,
					loc: right.loc
				},
				loc: expr.loc
			};
			if (state.functionDepth === 0 && state.deferredGlobalFunctions.some((d$1) => d$1.name === leftName && d$1.loc.start === expr.loc.start && d$1.loc.end === expr.loc.end)) return;
			compileFunction(state, fnExpr, leftName);
			if (stack.length === 0) return;
			const varInfo = declareVariable(state, leftName, expr.loc);
			ops.push(AudioVmOp.Dup);
			stack.push({ expr: right });
			compileSetVariable(state, varInfo, left);
			stack.pop();
			stack.push(stackExpr);
			return;
		}
		if (left.type === "identifier" && left.name === "scale" && (op === "=" || op === ":=")) {
			if (right.type !== "string") {
				error(state, "scale must be set to a string literal", expr.loc);
				return;
			}
			const scaleIdx = findScaleIndex(right.value);
			if (scaleIdx === void 0) {
				error(state, `Unknown scale: ${right.value}`, expr.loc);
				return;
			}
			state.scale = right.value;
			state.scaleIndex = scaleIdx;
			const varInfo = declareVariable(state, "scale", expr.loc);
			ops.push(AudioVmOp.PushScalar, 0, AudioVmOp.SetGlobal, varInfo.index, AudioVmOp.PushScalar, 0);
			stack.push(stackExpr);
			return;
		}
		if (left.type === "identifier" && left.name === "bpm" && (op === "=" || op === ":=")) {
			if (right.type !== "number") {
				error(state, "bpm must be set to a literal number", expr.loc);
				return;
			}
			const bpm = right.value;
			if (!Number.isFinite(bpm) || bpm <= 0) {
				error(state, "bpm must be a finite number > 0", expr.loc);
				return;
			}
			ops.push(AudioVmOp.SetBpm, bpm);
			state.bpm = bpm;
			ops.push(AudioVmOp.PushScalar, bpm);
			stack.push(stackExpr);
			return;
		}
		if (left.type === "index") {
			const isCompound = op !== "=" && op !== ":=";
			const opCode = COMPOUND_ASSIGN_OP_TO_OPCODE[op];
			const stackRight = { expr: right };
			const stackLeft = { expr: left };
			if (isCompound && opCode === void 0) {
				error(state, "Compound assignment not supported for array elements", expr.loc);
				return;
			}
			compileExpr(state, left.object);
			if (stack.length === 0) {
				error(state, "Array expression has no value", expr.loc);
				return;
			}
			compileExpr(state, left.index);
			if (stack.length === 0) {
				error(state, "Index expression has no value", expr.loc);
				return;
			}
			if (isCompound) {
				const isGlobal = state.functionDepth === 0;
				const a$1 = isGlobal ? state.nextGlobalIndex++ : state.nextLocalIndex++;
				const b$1 = isGlobal ? state.nextGlobalIndex++ : state.nextLocalIndex++;
				const v$1 = isGlobal ? state.nextGlobalIndex++ : state.nextLocalIndex++;
				const saveOp = isGlobal ? AudioVmOp.SetGlobal : AudioVmOp.SetLocal;
				const loadOp = isGlobal ? AudioVmOp.GetGlobal : AudioVmOp.GetLocal;
				ops.push(saveOp, a$1);
				stack.pop();
				ops.push(saveOp, b$1);
				stack.pop();
				ops.push(loadOp, b$1, loadOp, a$1, AudioVmOp.ArrayGet, 0);
				stack.pop();
				stack.pop();
				stack.push(stackLeft);
				compileExpr(state, right);
				if (stack.length < 2) {
					error(state, "Compound assignment missing operands", expr.loc);
					return;
				}
				ops.push(opCode);
				stack.pop();
				stack.pop();
				stack.push(stackExpr);
				ops.push(saveOp, v$1);
				stack.pop();
				ops.push(loadOp, b$1, loadOp, a$1, loadOp, v$1);
				stack.push(stackRight);
				ops.push(AudioVmOp.ArraySet);
				stack.pop();
				stack.pop();
				stack.pop();
				ops.push(loadOp, v$1);
				stack.pop();
				stack.push(stackExpr);
			} else {
				compileExpr(state, right);
				if (stack.length === 0) {
					error(state, "Assignment has no value", expr.loc);
					return;
				}
				if (state.functionDepth === 0) {
					const tempGlobalIdx = state.nextGlobalIndex++;
					ops.push(AudioVmOp.SetGlobal, tempGlobalIdx);
					stack.pop();
					ops.push(AudioVmOp.GetGlobal, tempGlobalIdx);
					stack.push(stackRight);
					ops.push(AudioVmOp.ArraySet);
					stack.pop();
					stack.pop();
					stack.pop();
					ops.push(AudioVmOp.GetGlobal, tempGlobalIdx);
					stack.pop();
					stack.push(stackExpr);
				} else {
					const tempIndex = state.nextLocalIndex++;
					ops.push(AudioVmOp.SetLocal, tempIndex);
					stack.pop();
					ops.push(AudioVmOp.GetLocal, tempIndex);
					stack.push(stackRight);
					ops.push(AudioVmOp.ArraySet);
					stack.pop();
					stack.pop();
					stack.pop();
					ops.push(AudioVmOp.GetLocal, tempIndex);
					stack.pop();
					stack.push(stackExpr);
				}
			}
			return;
		}
		if (right.type === "fn" && left.type === "identifier") {
			const leftName = left.name;
			if (leftName === "mix") state.mixDefinitionLoc = expr.loc;
			if (state.functionDepth === 0 && state.deferredGlobalFunctions.some((d$1) => d$1.name === leftName && d$1.loc.start === expr.loc.start && d$1.loc.end === expr.loc.end)) return;
			const shadow = op === ":=";
			const varInfo = declareVariable(state, leftName, expr.loc, shadow);
			compileFunction(state, right, leftName);
			if (stack.length === 0) return;
			ops.push(AudioVmOp.Dup);
			stack.push({ expr: right });
			compileSetVariable(state, varInfo, left);
			stack.pop();
			stack.push(stackExpr);
			return;
		}
		if (op === "=" || op === ":=") {
			if (left.type === "identifier" && right.type === "array") state.varToArrayLiteral.set(left.name, right);
			if (left.type === "identifier" && right.type === "identifier" && hasFunctionByName(state, right.name)) state.functionAliases.set(left.name, right.name);
			compileExpr(state, right);
			if (stack.length === 0) {
				error(state, "Assignment has no value", expr.loc);
				return;
			}
			const shadow = op === ":=";
			const varInfo = declareVariable(state, left.name, expr.loc, shadow);
			ops.push(AudioVmOp.Dup);
			stack.push({ expr: right });
			compileSetVariable(state, varInfo, left);
			stack.pop();
			stack.push(stackExpr);
		} else {
			const varInfo = lookupVariable(state, left.name);
			if (!varInfo) {
				error(state, `Unknown variable: ${left.name}`, expr.loc);
				return;
			}
			compileGetVariable(state, varInfo);
			stack.push({ expr: left });
			compileExpr(state, right);
			if (stack.length < 2) {
				error(state, "Compound assignment missing operands", expr.loc);
				return;
			}
			const opCode = COMPOUND_ASSIGN_OP_TO_OPCODE[op];
			if (opCode !== void 0) {
				ops.push(opCode);
				stack.pop();
				stack.pop();
				stack.push(stackExpr);
			}
			ops.push(AudioVmOp.Dup);
			stack.push(stackExpr);
			compileSetVariable(state, varInfo, left);
			stack.pop();
			stack.push(stackExpr);
		}
	}
	function detectClosureVars(state, expr, outerLocals) {
		const outerPipe = state.pipeVars[state.pipeVars.length - 1];
		const includePipe = !!outerPipe && outerPipe.functionDepth < state.functionDepth;
		const includeGlobals = state.captureGlobalsInClosures;
		let scopes = outerLocals;
		if (includePipe || includeGlobals) {
			scopes = scopes.slice();
			if (includePipe) scopes.push(PIPE_SCOPE);
			if (includeGlobals) scopes.push(state.globals);
		}
		return collectClosureVarNames(expr, scopes, { systemVars: SYSTEM_VARS });
	}
	function detectCapturedVarsInBody(state, body) {
		const names = collectCapturedVarNames(body, { systemVars: SYSTEM_VARS });
		const captured = [];
		for (const name of names) {
			const info = lookupVariable(state, name);
			if (info) captured.push({
				name,
				info
			});
		}
		return captured;
	}
	function compileNoteVar(state, name, loc) {
		emitMidiToHzCall(state, noteNameToMidi(name), loc);
	}
	function compileDtofCall(state, degree, loc) {
		const midi = degreeToMidiTs(state.rootMidi, state.scaleIndex, degree);
		if (midi < 0) {
			error(state, `dtof: invalid degree ${degree} for current scale`, loc);
			return;
		}
		emitMidiToHzCall(state, midi, loc);
	}
	function getMidiToHzVar(state) {
		return lookupVariable(state, "midiToHz") ?? lookupVariable(state, "ntof") ?? lookupVariable(state, "mtof");
	}
	function emitMidiToHzCall(state, midi, loc) {
		const varInfo = getMidiToHzVar(state);
		if (!varInfo) {
			error(state, "midiToHz (or ntof) must be defined before using note/chord variables", loc);
			return;
		}
		state.ops.push(AudioVmOp.PushScalar);
		state.ops.push(midi);
		compileGetVariable(state, varInfo);
		state.ops.push(AudioVmOp.CallFunction);
		state.ops.push(1);
		state.stack.push({ expr: {
			type: "number",
			value: 0,
			loc
		} });
	}
	function resolveHashVar(name, state) {
		if (!name.startsWith("#")) return null;
		const rest = name.slice(1);
		if (rest === "scale") {
			const intervals = getScaleIntervalsByIndex(state.scaleIndex);
			if (!intervals || intervals.length === 0) return null;
			const rootMidi = state.rootMidi;
			const midis = [];
			for (let d$1 = 1; d$1 <= intervals.length; d$1++) {
				const m$1 = degreeToMidiTs(rootMidi, state.scaleIndex, d$1);
				if (m$1 >= 0) midis.push(m$1);
			}
			return { midis };
		}
		const scaleDegreeMatch = rest.match(/^(\d+)$/);
		if (scaleDegreeMatch) {
			const degree = parseInt(scaleDegreeMatch[1], 10);
			const rootMidi = state.rootMidi;
			const midi = degreeToMidiTs(rootMidi, state.scaleIndex, degree);
			if (midi < 0) return null;
			return { midi };
		}
		const chordMatch = rest.match(/^([ivxlcdmIVXLCDM]+)(.*)$/);
		if (chordMatch) {
			const roman = chordMatch[1];
			const suffix = chordMatch[2] ?? "";
			const base = romanToDegree(roman);
			if (base === null) return null;
			const tones = parseChordSuffix(suffix);
			const rootMidi = state.rootMidi;
			const midis = [];
			for (const tone of tones) {
				const scaleDegree = base + tone.degree;
				const midi = degreeToMidiTs(rootMidi, state.scaleIndex, scaleDegree, tone.semitoneAdjust);
				if (midi >= 0) midis.push(midi);
			}
			return { midis };
		}
		return null;
	}
	function emitMapMidiToHz(state, midis, loc) {
		const mapVar = lookupVariable(state, "map");
		const midiToHzVar = getMidiToHzVar(state);
		if (!mapVar || !midiToHzVar) {
			error(state, "map and midiToHz (or ntof) must be defined before using chord variables", loc);
			return;
		}
		for (const m$1 of midis) {
			state.ops.push(AudioVmOp.PushScalar);
			state.ops.push(m$1);
		}
		state.ops.push(AudioVmOp.MakeArray);
		state.ops.push(midis.length);
		compileGetVariable(state, midiToHzVar);
		compileGetVariable(state, mapVar);
		state.ops.push(AudioVmOp.CallFunction);
		state.ops.push(2);
		state.stack.push({ expr: {
			type: "array",
			items: [],
			loc
		} });
	}
	function compileHashVar(state, name, loc) {
		const result = resolveHashVar(name, state);
		if (!result) {
			error(state, `Unknown # variable: ${name}`, loc);
			return;
		}
		if ("midi" in result) emitMidiToHzCall(state, result.midi, loc);
		else emitMapMidiToHz(state, result.midis, loc);
	}
	function allocateBytecode(operationCount) {
		const size = MINI_HEADER_SIZE + operationCount * Math.max(MINI_EVENT_BASE_SIZE, MINI_GROUP_START_SIZE, MINI_SCALE_SIZE, MINI_CYCLE_START_SIZE, MINI_CYCLE_END_SIZE, MINI_REST_SIZE, MINI_OCTAVE_SIZE, MINI_TRANSPOSE_SIZE, MINI_SWING_SIZE);
		return new Float32Array(size);
	}
	function writeEventOp(buffer, offset, values, modifiers) {
		const base = MINI_HEADER_SIZE + offset;
		let pc = 0;
		function emit(op) {
			buffer[base + pc] = op;
			pc++;
		}
		emit(MiniOp.Event);
		emit(Math.min(values.length, MINI_MAX_EVENT_VALUES));
		emit(modifiers.velocity);
		emit(modifiers.hold);
		emit(modifiers.replicate);
		emit(modifiers.elongate);
		emit(modifiers.density);
		emit(modifiers.offset);
		emit(modifiers.jitter);
		emit(modifiers.prob);
		emit(modifiers.glide);
		emit(modifiers.strum);
		for (let i$1 = 0; i$1 < MINI_MAX_EVENT_VALUES; i$1++) emit(values[i$1] ?? 0);
		return MINI_EVENT_BASE_SIZE;
	}
	function writeGroupStartOp(buffer, offset, childCount, mode, modifiers) {
		const base = MINI_HEADER_SIZE + offset;
		let pc = 0;
		function emit(op) {
			buffer[base + pc] = op;
			pc++;
		}
		emit(MiniOp.GroupStart);
		emit(childCount);
		emit(mode === 2 ? 2 : mode === 1 ? 1 : 0);
		emit(modifiers.velocity);
		emit(modifiers.hold);
		emit(modifiers.replicate);
		emit(modifiers.elongate);
		emit(modifiers.density);
		emit(modifiers.offset);
		emit(modifiers.jitter);
		emit(modifiers.prob);
		emit(modifiers.glide);
		emit(modifiers.strum);
		return MINI_GROUP_START_SIZE;
	}
	function writeGroupEndOp(buffer, offset) {
		const base = MINI_HEADER_SIZE + offset;
		buffer[base + 0] = MiniOp.GroupEnd;
		return MINI_GROUP_END_SIZE;
	}
	function writeCycleStartOp(buffer, offset, pos, loop, childCount) {
		const base = MINI_HEADER_SIZE + offset;
		buffer[base + 0] = MiniOp.CycleStart;
		buffer[base + 1] = pos;
		buffer[base + 2] = loop;
		buffer[base + 3] = childCount;
		return MINI_CYCLE_START_SIZE;
	}
	function writeCycleEndOp(buffer, offset) {
		const base = MINI_HEADER_SIZE + offset;
		buffer[base + 0] = MiniOp.CycleEnd;
		return MINI_CYCLE_END_SIZE;
	}
	function writeOctaveOp(buffer, offset, delta) {
		const base = MINI_HEADER_SIZE + offset;
		buffer[base + 0] = MiniOp.Octave;
		buffer[base + 1] = delta;
		return MINI_OCTAVE_SIZE;
	}
	function writeTransposeOp(buffer, offset, delta) {
		const base = MINI_HEADER_SIZE + offset;
		buffer[base + 0] = MiniOp.Transpose;
		buffer[base + 1] = delta;
		return MINI_TRANSPOSE_SIZE;
	}
	function writeScaleOp(buffer, offset, rootMidi, scaleIndex) {
		const base = MINI_HEADER_SIZE + offset;
		buffer[base + 0] = MiniOp.Scale;
		buffer[base + 1] = rootMidi;
		buffer[base + 2] = scaleIndex;
		return MINI_SCALE_SIZE;
	}
	function writeSwingOp(buffer, offset, amount) {
		const base = MINI_HEADER_SIZE + offset;
		buffer[base + 0] = MiniOp.Swing;
		buffer[base + 1] = amount;
		return MINI_SWING_SIZE;
	}
	function buildSourceMapFromNodes(nodes, _bytecode, offset, map) {
		let currentOffset = offset;
		for (const node of nodes) if (node.type === "event") {
			const opIndex = currentOffset;
			map.set(opIndex, {
				text: node.source.text,
				start: node.source.start,
				end: node.source.start + node.source.length
			});
			currentOffset += MINI_EVENT_BASE_SIZE;
		} else if (node.type === "rest") {
			const opIndex = currentOffset;
			map.set(opIndex, {
				text: node.source.text,
				start: node.source.start,
				end: node.source.start + node.source.length
			});
			currentOffset += MINI_EVENT_BASE_SIZE;
		} else if (node.type === "octave") {
			const opIndex = currentOffset;
			map.set(opIndex, {
				text: node.source.text,
				start: node.source.start,
				end: node.source.start + node.source.length
			});
			currentOffset += MINI_OCTAVE_SIZE;
		} else if (node.type === "transpose") {
			const opIndex = currentOffset;
			map.set(opIndex, {
				text: node.source.text,
				start: node.source.start,
				end: node.source.start + node.source.length
			});
			currentOffset += MINI_TRANSPOSE_SIZE;
		} else if (node.type === "scale") {
			const opIndex = currentOffset;
			map.set(opIndex, {
				text: node.source.text,
				start: node.source.start,
				end: node.source.start + node.source.length
			});
			currentOffset += MINI_SCALE_SIZE;
		} else if (node.type === "swing") {
			const opIndex = currentOffset;
			map.set(opIndex, {
				text: node.source.text,
				start: node.source.start,
				end: node.source.start + node.source.length
			});
			currentOffset += MINI_SWING_SIZE;
		} else if (node.type === "group") {
			currentOffset += MINI_GROUP_START_SIZE;
			currentOffset = buildSourceMapFromNodes(node.children, _bytecode, currentOffset, map);
			currentOffset += MINI_GROUP_END_SIZE;
		} else if (node.type === "at") {
			currentOffset += MINI_CYCLE_START_SIZE;
			currentOffset = buildSourceMapFromNodes(node.children, _bytecode, currentOffset, map);
			currentOffset += MINI_CYCLE_END_SIZE;
		}
		return currentOffset;
	}
	const cacheByMiniSourceMap = /* @__PURE__ */ new Map();
	function buildMiniSourceMap(src, nodes, bytecode) {
		const cached = cacheByMiniSourceMap.get(src);
		if (cached) return cached;
		if (cacheByMiniSourceMap.size > 1e3) cacheByMiniSourceMap.clear();
		const map = /* @__PURE__ */ new Map();
		buildSourceMapFromNodes(nodes, bytecode, MINI_GROUP_START_SIZE, map);
		const result = map;
		cacheByMiniSourceMap.set(src, result);
		return result;
	}
	function euclidHit(pulses, steps, step, offset = 0) {
		if (steps <= 0) return false;
		if (pulses <= 0) return false;
		if (pulses >= steps) return true;
		let s$1 = step + offset;
		s$1 %= steps;
		if (s$1 < 0) s$1 += steps;
		return s$1 * pulses % steps < pulses;
	}
	const DEFAULT_MODS = {
		velocity: 1,
		hold: 0,
		replicate: 1,
		elongate: 1,
		density: 1,
		offset: 0,
		jitter: 0,
		prob: 0,
		glide: 0,
		strum: 0
	};
	const MODIFIER_START = new Set([
		"*",
		"!",
		"@",
		"/",
		"\\",
		".",
		";",
		"?",
		"+",
		"-",
		"$"
	]);
	const GROUP_OPEN = new Set([
		"[",
		"<",
		"("
	]);
	function cloneMods(mods) {
		return { ...mods };
	}
	function getDefaultMods() {
		return cloneMods(DEFAULT_MODS);
	}
	function parseModifiers(text) {
		const mods = getDefaultMods();
		let i$1 = 0;
		while (i$1 < text.length) {
			const ch = text[i$1];
			const rest = text.slice(i$1 + 1);
			switch (ch) {
				case "*": {
					const m$1 = rest.match(/^([\d.]+)/);
					if (m$1) {
						mods.density = parseFloat(m$1[1]) || 1;
						i$1 += m$1[0].length + 1;
					} else i$1++;
					break;
				}
				case "!": {
					const m$1 = rest.match(/^([\d.]+)/);
					if (m$1) {
						mods.replicate = parseFloat(m$1[1]) || 1;
						i$1 += m$1[0].length + 1;
					} else i$1++;
					break;
				}
				case "@": {
					const m$1 = rest.match(/^([\d.]+)/);
					if (m$1) {
						mods.elongate = parseFloat(m$1[1]) || 1;
						i$1 += m$1[0].length + 1;
					} else i$1++;
					break;
				}
				case "/": {
					const m$1 = rest.match(/^([\d.]+)/);
					if (m$1) {
						mods.density = 1 / (parseFloat(m$1[1]) || 1);
						i$1 += m$1[0].length + 1;
					} else i$1++;
					break;
				}
				case "\\": {
					const m$1 = rest.match(/^(-?[\d.]+)/);
					if (m$1 && m$1[1]) {
						mods.glide = parseFloat(m$1[1]);
						i$1 += m$1[0].length + 1;
					} else {
						mods.glide = 1;
						i$1++;
					}
					break;
				}
				case ".": {
					const m$1 = rest.match(/^([\d.]+)/);
					if (m$1) {
						const raw = m$1[1];
						let factor = parseFloat(raw);
						if (raw.indexOf(".") === -1) factor = parseFloat("0." + raw);
						mods.velocity *= factor;
						i$1 += m$1[0].length + 1;
					} else i$1++;
					break;
				}
				case ";": {
					const m$1 = rest.match(/^([\d.]+)/);
					if (m$1) {
						mods.hold = parseFloat(m$1[1]);
						i$1 += m$1[0].length + 1;
					} else i$1++;
					break;
				}
				case "?": {
					const m$1 = rest.match(/^([\d.]+)/);
					if (m$1) {
						mods.prob = parseFloat(m$1[1]);
						i$1 += m$1[0].length + 1;
					} else {
						mods.prob = .5;
						i$1++;
					}
					break;
				}
				case "+":
					if (rest.startsWith("?")) {
						const m$1 = rest.slice(1).match(/^([\d.]*)/);
						mods.jitter = m$1 && m$1[1] ? parseFloat(m$1[1]) : .5;
						i$1 += (m$1?.[0]?.length ?? 0) + 2;
					} else {
						const m$1 = rest.match(/^([\d.]+)/);
						if (m$1) {
							mods.offset += parseFloat(m$1[1]);
							i$1 += m$1[0].length + 1;
						} else i$1++;
					}
					break;
				case "-": {
					const m$1 = rest.match(/^([\d.]+)/);
					if (m$1) {
						mods.offset -= parseFloat(m$1[1]);
						i$1 += m$1[0].length + 1;
					} else i$1++;
					break;
				}
				case "$": {
					let j$1 = i$1;
					while (j$1 < text.length && text[j$1] === "$") j$1++;
					const dollarCount = j$1 - i$1;
					const m$1 = text.slice(j$1).match(/^([\d.]+)/);
					if (m$1) {
						const raw = parseFloat(m$1[1]);
						mods.strum = (dollarCount >= 4 ? 3 : dollarCount === 3 ? 2 : dollarCount === 2 ? 1 : 0) + Math.min(Math.max(raw, 0), .999999);
						i$1 = j$1 + m$1[0].length;
					} else i$1 = j$1;
					break;
				}
				default: i$1++;
			}
		}
		return mods;
	}
	function tokenize$1(input) {
		const tokens = [];
		let i$1 = 0;
		while (i$1 < input.length) {
			if (/\s/.test(input[i$1])) {
				i$1++;
				continue;
			}
			const start = i$1;
			const ch = input[i$1];
			if (ch === ":") {
				tokens.push({
					text: ":",
					start,
					end: i$1 + 1
				});
				i$1++;
				continue;
			}
			if (ch === "/" && input[i$1 + 1] === "/") {
				let j$1 = i$1 + 2;
				while (j$1 < input.length && input[j$1] !== "\n" && input[j$1] !== "\r") j$1++;
				tokens.push({
					text: input.slice(start, j$1),
					start,
					end: j$1
				});
				i$1 = j$1;
				continue;
			}
			if (GROUP_OPEN.has(ch)) {
				const close = ch === "[" ? "]" : ch === "<" ? ">" : ")";
				i$1++;
				let depth = 1;
				while (i$1 < input.length && depth > 0) {
					if (input[i$1] === ch) depth++;
					else if (input[i$1] === close) depth--;
					i$1++;
				}
				while (i$1 < input.length) {
					const c$1 = input[i$1];
					if (c$1 === ":" || /\s/.test(c$1) || GROUP_OPEN.has(c$1) || c$1 === "]" || c$1 === ">" || c$1 === ")") break;
					i$1++;
				}
				tokens.push({
					text: input.slice(start, i$1),
					start,
					end: i$1
				});
				continue;
			}
			i$1++;
			while (i$1 < input.length) {
				const c$1 = input[i$1];
				if (c$1 === ":" || /\s/.test(c$1) || GROUP_OPEN.has(c$1) || c$1 === "]" || c$1 === ">" || c$1 === ")") break;
				i$1++;
			}
			tokens.push({
				text: input.slice(start, i$1),
				start,
				end: i$1
			});
		}
		const mergedTokens = [];
		for (let ti = 0; ti < tokens.length; ti++) {
			const t$1 = tokens[ti];
			const next = tokens[ti + 1];
			if (next && t$1.end === next.start && /^[A-Za-z]+$/.test(t$1.text) && /^[0-9]+$/.test(next.text)) {
				mergedTokens.push({
					text: t$1.text + next.text,
					start: t$1.start,
					end: next.end
				});
				ti++;
			} else mergedTokens.push(t$1);
		}
		return mergedTokens;
	}
	function splitValueAndModifiers(text) {
		let i$1 = 0;
		while (i$1 < text.length) {
			const ch = text[i$1];
			if (MODIFIER_START.has(ch) && !(i$1 === 0 && (ch === "-" || ch === "+") && /\d/.test(text[i$1 + 1] ?? ""))) break;
			i$1++;
		}
		return {
			value: text.slice(0, i$1),
			mods: text.slice(i$1)
		};
	}
	function parseValues(valueText) {
		const values = [];
		let cursor = 0;
		while (cursor < valueText.length) {
			while (cursor < valueText.length && (valueText[cursor] === "," || /\s/.test(valueText[cursor]))) cursor++;
			if (cursor >= valueText.length) break;
			const rest = valueText.slice(cursor);
			const noteMatch = rest.match(/^([a-gA-G][#b]?)(-?\d+)/);
			if (noteMatch) {
				const midi = noteNameToMidi(noteMatch[1] + noteMatch[2]);
				values.push(midiToFrequency(midi));
				cursor += noteMatch[0].length;
				continue;
			}
			const numMatch = rest.match(/^-?[\d.]+/);
			if (numMatch) {
				values.push(parseFloat(numMatch[0]));
				cursor += numMatch[0].length;
				continue;
			}
			cursor++;
		}
		return values;
	}
	function isNoteNameText(text) {
		return /^([a-gA-G][#b]?)(-?\d+)$/.test(text);
	}
	function makeSource(input, start, end) {
		return {
			start,
			length: end - start,
			text: input.slice(start, end)
		};
	}
	function nodesSpan(nodes) {
		const first = nodes[0];
		const last = nodes.at(-1);
		if (!first || !last) return null;
		return {
			start: first.source.start,
			end: last.source.start + last.source.length
		};
	}
	function parseGroupedTokenText(raw, open) {
		const close = open === "[" ? "]" : open === "<" ? ">" : ")";
		const closingIndex = raw.lastIndexOf(close);
		if (closingIndex === -1) return {
			inner: raw.slice(1),
			modText: ""
		};
		const inner = raw.slice(1, closingIndex);
		const { mods: modText } = splitValueAndModifiers(raw.slice(closingIndex + 1));
		return {
			inner,
			modText
		};
	}
	function parseDeltaToken(token) {
		const raw = token?.text;
		if (!raw) return 0;
		const v$1 = parseFloat(raw);
		return Number.isFinite(v$1) ? v$1 : 0;
	}
	function parseEuclidToken(raw) {
		if (!raw.startsWith("(")) return null;
		if (!raw.endsWith(")")) return null;
		const inner = raw.slice(1, -1).trim();
		if (!/^\d+\s*,\s*\d+(?:\s*,\s*-?\d+)?$/.test(inner)) return null;
		const parts = inner.split(",").map((s$1) => parseInt(s$1.trim(), 10));
		const pulses = parts[0];
		const steps = parts[1];
		const offset = parts.length >= 3 ? parts[2] : 0;
		if (!Number.isFinite(pulses) || !Number.isFinite(steps) || !Number.isFinite(offset)) return null;
		return {
			pulses,
			steps,
			offset
		};
	}
	function cloneEventNode(node, nextSource, values) {
		return {
			type: "event",
			angle: false,
			parallel: false,
			values,
			children: [],
			modifiers: cloneMods(node.modifiers),
			source: nextSource
		};
	}
	function parseOctaveDelta(tokens) {
		return parseDeltaToken(tokens[1]);
	}
	function parseScaleDirective(tokens, startIndex) {
		let i$1 = startIndex;
		let rootMidi = noteNameToMidi("c4");
		let scaleIndex = SCALE_KEY_TO_INDEX.major ?? 0;
		const t0 = tokens[i$1]?.text?.toLowerCase();
		if (t0 && isNoteNameText(t0)) {
			rootMidi = noteNameToMidi(t0);
			i$1++;
		}
		const t1$1 = tokens[i$1]?.text?.toLowerCase();
		if (t1$1) {
			if (/^[a-z][a-z0-9]*$/.test(t1$1)) {
				let scaleName = t1$1;
				const nextToken = tokens[i$1 + 1];
				if (/^[a-z]+$/.test(t1$1) && nextToken && /^[0-9]+$/.test(nextToken.text) && nextToken.start === tokens[i$1].end) {
					scaleName = t1$1 + nextToken.text;
					i$1++;
				}
				scaleIndex = findScaleIndex(scaleName) ?? scaleIndex;
				i$1++;
			}
		}
		return {
			rootMidi,
			scaleIndex,
			nextIndex: i$1
		};
	}
	function tokensToNodesInternal(tokens, input) {
		const nodes = [];
		for (let ti = 0; ti < tokens.length; ti++) {
			const token = tokens[ti];
			const raw = token.text;
			const first = raw[0];
			if (raw.startsWith("//")) continue;
			if (raw === ",") {
				const left = nodes.slice();
				const rightTokens = tokens.slice(ti + 1);
				const right = rightTokens.length > 0 ? tokensToNodesInternal(rightTokens, input) : [];
				if (left.length === 0 && right.length === 0) return [];
				if (left.length === 0) return right;
				if (right.length === 0) return left;
				const leftGroup = {
					type: "group",
					angle: false,
					parallel: false,
					values: [],
					children: left,
					modifiers: getDefaultMods(),
					source: makeSource(input, left[0].source.start, left.at(-1).source.start + left.at(-1).source.length)
				};
				const rightGroup = {
					type: "group",
					angle: false,
					parallel: false,
					values: [],
					children: right,
					modifiers: getDefaultMods(),
					source: makeSource(input, right[0].source.start, right.at(-1).source.start + right.at(-1).source.length)
				};
				const endToken = rightTokens.at(-1) ?? token;
				return [{
					type: "group",
					angle: false,
					parallel: true,
					values: [],
					children: [leftGroup, rightGroup],
					modifiers: getDefaultMods(),
					source: makeSource(input, leftGroup.source.start, endToken.end)
				}];
			}
			if (raw === ".") {
				const segments = [];
				if (nodes.length > 0) segments.push(nodes.slice());
				let segStart = ti + 1;
				for (let j$1 = ti + 1; j$1 <= tokens.length; j$1++) {
					const isEnd = j$1 === tokens.length;
					const isDot = !isEnd && tokens[j$1]?.text === ".";
					if (!isEnd && !isDot) continue;
					const partTokens = tokens.slice(segStart, j$1);
					const partNodes = partTokens.length > 0 ? tokensToNodesInternal(partTokens, input) : [];
					if (partNodes.length > 0) segments.push(partNodes);
					segStart = j$1 + 1;
				}
				if (segments.length === 0) return [];
				if (segments.length === 1) return segments[0];
				const loop = segments.length;
				const onChildren = [];
				let groupStart = Infinity;
				let groupEnd = -Infinity;
				for (let si = 0; si < segments.length; si++) {
					const children = segments[si];
					const span = nodesSpan(children);
					const start = span?.start ?? 0;
					const end = span?.end ?? start;
					groupStart = Math.min(groupStart, start);
					groupEnd = Math.max(groupEnd, end);
					onChildren.push({
						type: "at",
						angle: false,
						parallel: false,
						values: [si + 1, loop],
						children,
						modifiers: getDefaultMods(),
						source: makeSource(input, start, end)
					});
				}
				if (!Number.isFinite(groupStart) || !Number.isFinite(groupEnd) || groupStart > groupEnd) {
					groupStart = 0;
					groupEnd = 0;
				}
				return [{
					type: "group",
					angle: false,
					parallel: false,
					values: [],
					children: onChildren,
					modifiers: getDefaultMods(),
					source: makeSource(input, groupStart, groupEnd)
				}];
			}
			if (first === "_") {
				const last = nodes.at(-1);
				if (last) last.modifiers.elongate += 1;
				continue;
			}
			if (raw === "scale") {
				const { rootMidi, scaleIndex, nextIndex } = parseScaleDirective(tokens, ti + 1);
				const last = nextIndex > ti + 1 ? tokens[nextIndex - 1] : token;
				nodes.push({
					type: "scale",
					angle: false,
					parallel: false,
					values: [rootMidi, scaleIndex],
					children: [],
					modifiers: getDefaultMods(),
					source: makeSource(input, token.start, last?.end ?? token.end)
				});
				ti = nextIndex - 1;
				continue;
			}
			if (raw === "at") {
				const next = tokens[ti + 1];
				const rawOn = next?.text ?? "";
				let pos = 0;
				let loop = 0;
				const slash = rawOn.indexOf("/");
				if (slash >= 0) {
					const a$1 = parseInt(rawOn.slice(0, slash), 10);
					const b$1 = parseInt(rawOn.slice(slash + 1), 10);
					pos = Number.isFinite(a$1) ? a$1 : 0;
					loop = Number.isFinite(b$1) ? b$1 : 0;
				} else {
					const a$1 = parseInt(rawOn, 10);
					pos = Number.isFinite(a$1) ? a$1 : 0;
				}
				const bodyStart = ti + 2;
				let bodyEnd = tokens.length;
				for (let j$1 = bodyStart; j$1 < tokens.length; j$1++) if (tokens[j$1]?.text === "at") {
					bodyEnd = j$1;
					break;
				}
				const children = tokensToNodesInternal(tokens.slice(bodyStart, bodyEnd), input);
				const last = tokens[bodyEnd - 1] ?? next ?? token;
				nodes.push({
					type: "at",
					angle: false,
					parallel: false,
					values: [pos, loop],
					children,
					modifiers: getDefaultMods(),
					source: makeSource(input, token.start, last?.end ?? token.end)
				});
				ti = bodyEnd - 1;
				continue;
			}
			if (raw === "octave" || raw === "transpose") {
				const next = tokens[ti + 1];
				const delta = parseDeltaToken(next);
				const end = next?.end ?? token.end;
				nodes.push({
					type: raw === "octave" ? "octave" : "transpose",
					angle: false,
					parallel: false,
					values: [delta],
					children: [],
					modifiers: getDefaultMods(),
					source: makeSource(input, token.start, end)
				});
				if (next) ti++;
				continue;
			}
			if (raw === "swing") {
				const next = tokens[ti + 1];
				const amount = parseDeltaToken(next);
				const end = next?.end ?? token.end;
				nodes.push({
					type: "swing",
					angle: false,
					parallel: false,
					values: [amount],
					children: [],
					modifiers: getDefaultMods(),
					source: makeSource(input, token.start, end)
				});
				if (next) ti++;
				continue;
			}
			if (first === "[" || first === "<") {
				const { inner, modText } = parseGroupedTokenText(raw, first);
				const modifiers$1 = parseModifiers(modText);
				const children = tokensToNodesInternal(tokenize$1(inner).map((t$1) => ({
					...t$1,
					start: t$1.start + token.start + 1,
					end: t$1.end + token.start + 1
				})), input);
				nodes.push({
					type: "group",
					angle: first === "<",
					parallel: false,
					values: [],
					children,
					modifiers: modifiers$1,
					source: makeSource(input, token.start, token.end)
				});
				continue;
			}
			if (first === "(") {
				const euclid = parseEuclidToken(raw);
				const last = nodes.at(-1);
				if (euclid && last?.type === "event") {
					const pulses = Math.floor(euclid.pulses);
					const steps = Math.floor(euclid.steps);
					const offset = Math.floor(euclid.offset);
					const spanSource = makeSource(input, last.source.start, token.end);
					nodes.pop();
					const safeSteps = Number.isFinite(steps) && steps > 0 ? steps : 0;
					for (let si = 0; si < safeSteps; si++) {
						const on = euclidHit(pulses, steps, si, offset);
						nodes.push(cloneEventNode(last, spanSource, on ? last.values.slice() : []));
					}
					continue;
				}
				const { inner, modText } = parseGroupedTokenText(raw, "(");
				const adjustedInnerTokens = tokenize$1(inner).map((t$1) => ({
					...t$1,
					start: t$1.start + token.start + 1,
					end: t$1.end + token.start + 1
				}));
				const head = adjustedInnerTokens[0]?.text;
				if (head === "scale") {
					const { rootMidi, scaleIndex, nextIndex } = parseScaleDirective(adjustedInnerTokens, 1);
					const items = adjustedInnerTokens.slice(nextIndex);
					const children$1 = [{
						type: "scale",
						angle: false,
						parallel: false,
						values: [rootMidi, scaleIndex],
						children: [],
						modifiers: getDefaultMods(),
						source: makeSource(input, token.start, token.end)
					}, ...tokensToNodesInternal(items, input)];
					nodes.push({
						type: "group",
						angle: false,
						parallel: false,
						values: [],
						children: children$1,
						modifiers: parseModifiers(modText),
						source: makeSource(input, token.start, token.end)
					});
					continue;
				}
				if (head === "octave") {
					nodes.push({
						type: "octave",
						angle: false,
						parallel: false,
						values: [parseOctaveDelta(adjustedInnerTokens)],
						children: [],
						modifiers: getDefaultMods(),
						source: makeSource(input, token.start, token.end)
					});
					continue;
				}
				if (head === "transpose") {
					nodes.push({
						type: "transpose",
						angle: false,
						parallel: false,
						values: [parseDeltaToken(adjustedInnerTokens[1])],
						children: [],
						modifiers: getDefaultMods(),
						source: makeSource(input, token.start, token.end)
					});
					continue;
				}
				if (head === "swing") {
					nodes.push({
						type: "swing",
						angle: false,
						parallel: false,
						values: [parseDeltaToken(adjustedInnerTokens[1])],
						children: [],
						modifiers: getDefaultMods(),
						source: makeSource(input, token.start, token.end)
					});
					continue;
				}
				const modifiers$1 = parseModifiers(modText);
				const children = tokensToNodesInternal(adjustedInnerTokens, input);
				nodes.push({
					type: "group",
					angle: false,
					parallel: false,
					values: [],
					children,
					modifiers: modifiers$1,
					source: makeSource(input, token.start, token.end)
				});
				continue;
			}
			const { value, mods } = splitValueAndModifiers(raw);
			if (value === "~") {
				const modifiers$1 = parseModifiers(mods);
				nodes.push({
					type: "rest",
					angle: false,
					parallel: false,
					values: [],
					children: [],
					modifiers: modifiers$1,
					source: makeSource(input, token.start, token.end)
				});
				continue;
			}
			let valueText = value;
			if (!valueText && mods) valueText = "c4";
			if (valueText?.toLowerCase() === "x") valueText = "c4";
			const chordMatch = valueText.match(/^([ivxlcdm]+)(.*)$/i);
			if (chordMatch) {
				const roman = chordMatch[1];
				const suffix = chordMatch[2] ?? "";
				const base = romanToDegree(roman);
				if (base !== null) {
					const values$1 = parseChordSuffix(suffix).map((tone) => {
						return -(base + tone.degree + tone.semitoneAdjust / 100);
					});
					const modifiers$1 = parseModifiers(mods);
					nodes.push({
						type: "event",
						angle: false,
						parallel: false,
						values: values$1,
						children: [],
						modifiers: modifiers$1,
						source: makeSource(input, token.start, token.end)
					});
					continue;
				}
			}
			if (/^\d+(?:,\d+)*$/.test(valueText)) {
				const values$1 = valueText.split(",").filter(Boolean).map((p$1) => -parseInt(p$1, 10));
				const modifiers$1 = parseModifiers(mods);
				nodes.push({
					type: "event",
					angle: false,
					parallel: false,
					values: values$1,
					children: [],
					modifiers: modifiers$1,
					source: makeSource(input, token.start, token.end)
				});
				continue;
			}
			const values = parseValues(valueText);
			const modifiers = parseModifiers(mods);
			nodes.push({
				type: "event",
				angle: false,
				parallel: false,
				values,
				children: [],
				modifiers,
				source: makeSource(input, token.start, token.end)
			});
		}
		return nodes;
	}
	function tokensToNodes(tokens, input, options$1 = {}) {
		const nodes = tokensToNodesInternal(tokens, input);
		if (!(nodes.some((node) => node.type === "scale") || nodes.some((node) => node.type === "group" && node.children.some((child) => child.type === "scale")))) {
			const defaultScaleNode = {
				type: "scale",
				angle: false,
				parallel: false,
				values: [options$1.defaultScale?.rootMidi ?? noteNameToMidi("c4"), options$1.defaultScale?.scaleIndex ?? SCALE_KEY_TO_INDEX.major ?? 0],
				children: [],
				modifiers: getDefaultMods(),
				source: {
					start: 0,
					length: 0,
					text: ""
				}
			};
			nodes.unshift(defaultScaleNode);
		}
		return nodes;
	}
	function compileNode(node, bytecode, offset) {
		if (node.type === "event") return writeEventOp(bytecode, offset, node.values, node.modifiers);
		else if (node.type === "group") {
			const mode = node.parallel ? 2 : node.angle ? 1 : 0;
			let currentOffset = writeGroupStartOp(bytecode, offset, node.children.length, mode, node.modifiers);
			for (const child of node.children) currentOffset += compileNode(child, bytecode, offset + currentOffset);
			currentOffset += writeGroupEndOp(bytecode, offset + currentOffset);
			return currentOffset;
		} else if (node.type === "rest") return writeEventOp(bytecode, offset, [], node.modifiers);
		else if (node.type === "octave") return writeOctaveOp(bytecode, offset, node.values[0] ?? 0);
		else if (node.type === "transpose") return writeTransposeOp(bytecode, offset, node.values[0] ?? 0);
		else if (node.type === "scale") return writeScaleOp(bytecode, offset, node.values[0] ?? 0, node.values[1] ?? 0);
		else if (node.type === "swing") return writeSwingOp(bytecode, offset, node.values[0] ?? 0);
		else if (node.type === "at") {
			let currentOffset = writeCycleStartOp(bytecode, offset, node.values[0] ?? 0, node.values[1] ?? 0, node.children.length);
			for (const child of node.children) currentOffset += compileNode(child, bytecode, offset + currentOffset);
			currentOffset += writeCycleEndOp(bytecode, offset + currentOffset);
			return currentOffset;
		}
		return 0;
	}
	const cacheByMiniNotation = /* @__PURE__ */ new Map();
	function compileMiniNotation(input, options$1 = {}) {
		const cacheKey = options$1.defaultScale ? `${input}|scale:${options$1.defaultScale.rootMidi ?? 60},${options$1.defaultScale.scaleIndex ?? 0}` : input;
		const cached = cacheByMiniNotation.get(cacheKey);
		if (cached) return cached;
		if (cacheByMiniNotation.size > 1e3) cacheByMiniNotation.clear();
		const nodes = tokensToNodes(tokenize$1(input), input, { defaultScale: options$1.defaultScale });
		const root = {
			type: "group",
			values: [],
			children: nodes,
			modifiers: getDefaultMods(),
			angle: false,
			parallel: false,
			source: {
				start: 0,
				length: input.length,
				text: input
			}
		};
		const bytecode = allocateBytecode(1024);
		let offset = compileNode(root, bytecode, 0);
		bytecode[0] = offset;
		const usedSize = MINI_HEADER_SIZE + offset;
		const trimmedBytecode = bytecode.slice(0, usedSize);
		const sourceMap = [];
		buildMiniSourceMap(input, nodes, trimmedBytecode).forEach((location, index) => {
			sourceMap.push({
				eventIndex: index,
				source: {
					start: location.start,
					length: location.end - location.start,
					text: location.text
				}
			});
		});
		const result = {
			bytecode: trimmedBytecode,
			sourceMap,
			nodes
		};
		cacheByMiniNotation.set(cacheKey, result);
		return result;
	}
	function compileMini(state, callExpr, args) {
		let seqExpr = null;
		let barsExpr = null;
		for (const arg of args) if (arg.type === "arg" && arg.value) {
			if (arg.name === "seq" || arg.name === "sequence") seqExpr = arg.value;
			else if (arg.name === "bars") barsExpr = arg.value;
			else if (!arg.name && !seqExpr) seqExpr = arg.value;
			else if (!arg.name && !barsExpr) barsExpr = arg.value;
		}
		if (!seqExpr) {
			error(state, "mini() requires a sequence string argument", callExpr.loc.line, callExpr.loc.column);
			return;
		}
		if (seqExpr.type !== "string") {
			error(state, "mini() sequence argument must be a string literal", callExpr.loc.line, callExpr.loc.column);
			return;
		}
		const sequence = seqExpr.value;
		const compileResult = compileMiniNotation(sequence, { defaultScale: {
			rootMidi: state.rootMidi,
			scaleIndex: state.scaleIndex
		} });
		if (compileResult.bytecode.length === 0) {
			error(state, "mini() sequence is empty", callExpr.loc.line, callExpr.loc.column);
			return;
		}
		const opLength = compileResult.bytecode[0];
		const ops = compileResult.bytecode.slice(1, 1 + opLength);
		const bytecodeWithHeader = [
			compileResult.bytecode.length,
			1,
			opLength,
			...ops
		];
		const bytecodeLength = 3 + opLength;
		if (barsExpr) compileExpr(state, barsExpr);
		else {
			state.ops.push(AudioVmOp.PushScalar);
			state.ops.push(1);
			state.stack.push({ expr: {
				type: "number",
				value: 1,
				loc: callExpr.loc
			} });
		}
		const pc = state.ops.length;
		if (callExpr.loc.line > state.preludeLines) {
			const historyEntry = {
				line: callExpr.loc.line - state.preludeLines,
				column: callExpr.loc.column,
				genName: "Mini",
				pc: state.inFunction ? 0 : pc,
				inFunction: state.inFunction,
				__fromMainProgram: !state.isDeferredPass,
				sequence,
				compileResult
			};
			state.historySourceMap.push(historyEntry);
			if (state.inFunction && state.currentFunctionId !== null) {
				historyEntry.__functionId = state.currentFunctionId;
				historyEntry.__relativePc = pc;
			} else historyEntry.pc = pc;
		}
		const transposeVar = lookupVariable(state, "transpose");
		const tuneVar = lookupVariable(state, "tune");
		const transposeIdx = transposeVar && transposeVar.scope === "global" ? transposeVar.index : -1;
		const tuneIdx = tuneVar && tuneVar.scope === "global" ? tuneVar.index : -1;
		state.ops.push(AudioVmOp.Mini);
		state.ops.push(bytecodeLength + 2);
		state.ops.push(...bytecodeWithHeader);
		state.ops.push(transposeIdx);
		state.ops.push(tuneIdx);
		state.stack.pop();
		state.stack.push({ expr: callExpr });
	}
	const OPCODE_INFO = {
		[AudioVmOp.PushScalar]: { kind: "param" },
		[AudioVmOp.PushAudio]: { kind: "param" },
		[AudioVmOp.SetBpm]: { kind: "param" },
		[AudioVmOp.GetSystem]: { kind: "param" },
		[AudioVmOp.GetGlobal]: { kind: "param" },
		[AudioVmOp.SetGlobal]: { kind: "param" },
		[AudioVmOp.GetLocal]: { kind: "param" },
		[AudioVmOp.SetLocal]: { kind: "param" },
		[AudioVmOp.GetClosure]: { kind: "param" },
		[AudioVmOp.SetClosure]: { kind: "param" },
		[AudioVmOp.GetCellRefLocal]: { kind: "param" },
		[AudioVmOp.GetCellRefGlobal]: { kind: "param" },
		[AudioVmOp.GetCellRefClosure]: { kind: "param" },
		[AudioVmOp.PushClosure]: { kind: "param" },
		[AudioVmOp.CallFunction]: { kind: "param" },
		[AudioVmOp.ArrayPush]: { kind: "param" },
		[AudioVmOp.MakeArray]: { kind: "param" },
		[AudioVmOp.ArrayGet]: { kind: "param" },
		[AudioVmOp.Out]: { kind: "param" },
		[AudioVmOp.Solo]: { kind: "param" },
		[AudioVmOp.MathUnary]: { kind: "param" },
		[AudioVmOp.MathBinary]: { kind: "param" },
		[AudioVmOp.MathTernary]: { kind: "param" },
		[AudioVmOp.Jump]: { kind: "pc-param" },
		[AudioVmOp.JumpIfFalse]: { kind: "pc-param" },
		[AudioVmOp.JumpIfTrue]: { kind: "pc-param" },
		[AudioVmOp.PushTryBlock]: { kind: "three-param" },
		[AudioVmOp.TableLookup]: { kind: "table" },
		[AudioVmOp.Alloc]: { kind: "param" },
		[AudioVmOp.Step]: { kind: "param" },
		[AudioVmOp.Random]: { kind: "param" },
		[AudioVmOp.Write]: { kind: "none" },
		[AudioVmOp.Tram]: { kind: "table" },
		[AudioVmOp.Mini]: { kind: "table" },
		[AudioVmOp.Timeline]: { kind: "table" },
		[AudioVmOp.DefineFunction]: { kind: "define-function" }
	};
	function isOpcode(value) {
		return Number.isInteger(value) && value >= 0 && value < 256;
	}
	function getOpcodeInfo(op) {
		return OPCODE_INFO[op] ?? { kind: "none" };
	}
	const FUNCTION_BYTECODE_CACHE_MAX_ENTRIES = 2048;
	const FUNCTION_BYTECODE_CACHE_MAX_WORDS = 2e6;
	const functionBytecodeCache = /* @__PURE__ */ new Map();
	let functionBytecodeCacheWords = 0;
	const hashScratchF32 = new Float32Array(1);
	const hashScratchU32 = new Uint32Array(hashScratchF32.buffer);
	function cacheGetFunctionBytecode(key) {
		const hit = functionBytecodeCache.get(key);
		if (!hit) return;
		functionBytecodeCache.delete(key);
		functionBytecodeCache.set(key, hit);
		return hit;
	}
	function cachePutFunctionBytecode(key, u32) {
		const existing = functionBytecodeCache.get(key);
		if (existing) {
			functionBytecodeCacheWords -= existing.length;
			functionBytecodeCache.delete(key);
		}
		functionBytecodeCache.set(key, u32);
		functionBytecodeCacheWords += u32.length;
		while (functionBytecodeCache.size > FUNCTION_BYTECODE_CACHE_MAX_ENTRIES || functionBytecodeCacheWords > FUNCTION_BYTECODE_CACHE_MAX_WORDS) {
			const first = functionBytecodeCache.entries().next().value;
			if (!first) break;
			functionBytecodeCache.delete(first[0]);
			functionBytecodeCacheWords -= first[1].length;
		}
	}
	function hashFunctionBytecodeSegment(ops, startPc, segLen) {
		let h1 = -2128831035;
		let h2 = -1640531527;
		for (let i$1 = 0; i$1 < segLen; i$1++) {
			hashScratchF32[0] = ops[startPc + i$1];
			const b$1 = hashScratchU32[0];
			h1 = Math.imul(h1 ^ b$1 + i$1, 16777619);
			h2 = Math.imul(h2 ^ b$1 + (i$1 << 1), 2246822507);
		}
		return `${segLen},${h1 >>> 0},${h2 >>> 0}`;
	}
	function patchPcParamsInRange(ops, startIndex, delta) {
		let pc = startIndex;
		const limit = ops.length;
		while (pc < limit) {
			const value = ops[pc];
			if (!isOpcode(value)) {
				pc++;
				continue;
			}
			const info = getOpcodeInfo(value);
			pc++;
			switch (info.kind) {
				case "pc-param":
					if (pc < limit) ops[pc++] += delta;
					break;
				case "three-param":
					if (pc < limit) ops[pc++] += delta;
					if (pc < limit) ops[pc++] += delta;
					if (pc < limit) pc++;
					break;
				case "define-function":
					if (pc + 5 < limit) {
						const bytecodeLen = ops[pc + 5];
						pc += 6 + bytecodeLen;
					}
					break;
				case "param":
				case "none":
					if (info.kind === "param") pc++;
					break;
				case "table":
					if (pc < limit) {
						const len = ops[pc++];
						pc += len;
					}
					break;
			}
		}
	}
	function getVal(ops, pc, patchMap, add) {
		if (patchMap == null) return ops[pc] + add;
		const v$1 = patchMap.get(pc);
		return v$1 !== void 0 ? v$1 : ops[pc] + add;
	}
	function encodeFunctionBytecode(ops, u32View, f32View, pc, limit, outputOffset = 0, jumpTargetAdd = 0, patchMap) {
		const startPc = pc;
		const canCache = patchMap == null && pc + 6 <= limit;
		let cacheKey = null;
		let cacheSegLen = 0;
		if (canCache) {
			cacheSegLen = 6 + ops[pc + 5];
			const segEnd = pc + cacheSegLen;
			if (segEnd <= limit) {
				cacheKey = hashFunctionBytecodeSegment(ops, pc, cacheSegLen);
				const cached = cacheGetFunctionBytecode(cacheKey);
				if (cached) {
					u32View.set(cached, outputOffset + pc);
					return segEnd;
				}
			} else {
				cacheKey = null;
				cacheSegLen = 0;
			}
		}
		for (let i$1 = 0; i$1 < 5 && pc < limit; i$1++) {
			f32View[outputOffset + pc] = getVal(ops, pc, patchMap, 0);
			pc++;
		}
		if (pc >= limit) return pc;
		const bytecodeLen = ops[pc];
		f32View[outputOffset + pc] = bytecodeLen;
		pc++;
		const bodyEnd = pc + bytecodeLen;
		const bodyJumpAdd = 0;
		while (pc < bodyEnd && pc < limit) {
			const value = ops[pc];
			if (!isOpcode(value)) {
				f32View[outputOffset + pc] = getVal(ops, pc, patchMap, 0);
				pc++;
				continue;
			}
			const opcode = value;
			const info = getOpcodeInfo(opcode);
			u32View[outputOffset + pc] = opcode;
			pc++;
			switch (info.kind) {
				case "none": break;
				case "param":
					if (pc < limit && pc < bodyEnd) {
						f32View[outputOffset + pc] = getVal(ops, pc, patchMap, 0);
						pc++;
					}
					break;
				case "pc-param":
					if (pc < limit && pc < bodyEnd) {
						f32View[outputOffset + pc] = getVal(ops, pc, patchMap, bodyJumpAdd);
						pc++;
					}
					break;
				case "three-param":
					if (pc < limit && pc < bodyEnd) f32View[outputOffset + pc] = getVal(ops, pc, patchMap, bodyJumpAdd);
					pc++;
					if (pc < limit && pc < bodyEnd) f32View[outputOffset + pc] = getVal(ops, pc, patchMap, bodyJumpAdd);
					pc++;
					if (pc < limit && pc < bodyEnd) f32View[outputOffset + pc] = getVal(ops, pc, patchMap, 0);
					pc++;
					break;
				case "table": {
					if (pc >= limit || pc >= bodyEnd) break;
					const len = ops[pc];
					f32View[outputOffset + pc] = len;
					pc++;
					for (let j$1 = 0; j$1 < len && pc < limit && pc < bodyEnd; j$1++) {
						f32View[outputOffset + pc] = getVal(ops, pc, patchMap, 0);
						pc++;
					}
					break;
				}
				case "define-function":
					pc = encodeFunctionBytecode(ops, u32View, f32View, pc, Math.min(limit, bodyEnd), outputOffset, jumpTargetAdd, patchMap);
					break;
			}
		}
		if (cacheKey && cacheSegLen > 0 && pc === startPc + cacheSegLen) {
			const encoded = u32View.slice(outputOffset + startPc, outputOffset + startPc + cacheSegLen);
			cachePutFunctionBytecode(cacheKey, encoded);
		}
		return pc;
	}
	function encodeToBuffer(ops, u32View, f32View, outputOffset, jumpTargetAdd, patchMap) {
		const limit = ops.length;
		let pc = 0;
		while (pc < limit) {
			const value = ops[pc];
			if (!isOpcode(value)) {
				f32View[outputOffset + pc] = getVal(ops, pc, patchMap, 0);
				pc++;
				continue;
			}
			const opcode = value;
			const info = getOpcodeInfo(opcode);
			u32View[outputOffset + pc] = opcode;
			pc++;
			switch (info.kind) {
				case "none": break;
				case "param":
					if (pc < limit) {
						f32View[outputOffset + pc] = getVal(ops, pc, patchMap, 0);
						pc++;
					}
					break;
				case "pc-param":
					if (pc < limit) {
						f32View[outputOffset + pc] = getVal(ops, pc, patchMap, jumpTargetAdd);
						pc++;
					}
					break;
				case "three-param":
					if (pc < limit) f32View[outputOffset + pc] = getVal(ops, pc, patchMap, jumpTargetAdd);
					pc++;
					if (pc < limit) f32View[outputOffset + pc] = getVal(ops, pc, patchMap, jumpTargetAdd);
					pc++;
					if (pc < limit) f32View[outputOffset + pc] = getVal(ops, pc, patchMap, 0);
					pc++;
					break;
				case "table": {
					if (pc >= limit) break;
					const len = ops[pc];
					f32View[outputOffset + pc] = len;
					pc++;
					for (let i$1 = 0; i$1 < len && pc < limit; i$1++) {
						f32View[outputOffset + pc] = getVal(ops, pc, patchMap, 0);
						pc++;
					}
					break;
				}
				case "define-function":
					pc = encodeFunctionBytecode(ops, u32View, f32View, pc, limit, outputOffset, jumpTargetAdd, patchMap);
					break;
			}
		}
	}
	function encodeBytecode(ops, u32View, f32View) {
		encodeToBuffer(ops, u32View, f32View, 0, 0);
	}
	function encodeCallbackBytecode(ops) {
		const buffer = /* @__PURE__ */ new ArrayBuffer(ops.length * 4);
		const u32View = new Uint32Array(buffer);
		const f32View = new Float32Array(buffer);
		encodeBytecode(ops, u32View, f32View);
		return f32View;
	}
	function collectGlobalIndicesFromOps(ops, start, end, out) {
		let pc = start;
		while (pc < end) {
			const value = ops[pc];
			if (!isOpcode(value)) {
				pc++;
				continue;
			}
			const info = getOpcodeInfo(value);
			pc++;
			switch (info.kind) {
				case "param":
					if (value === AudioVmOp.GetGlobal && pc < end) out.add(Math.round(ops[pc]));
					pc++;
					break;
				case "define-function":
					if (pc + 5 < end) {
						const bodyLen = Math.round(ops[pc + 5]);
						const bodyStart = pc + 6;
						const bodyEnd = bodyStart + bodyLen;
						collectGlobalIndicesFromOps(ops, bodyStart, Math.min(bodyEnd, end), out);
						pc = bodyEnd;
					}
					break;
				case "pc-param":
				case "three-param":
					if (info.kind === "pc-param") pc++;
					else pc += 3;
					break;
				case "table":
					if (pc < end) {
						const len = Math.round(ops[pc]);
						pc += 1 + len;
					}
					break;
				case "none": break;
			}
		}
	}
	function collectCalleeNamesFromBody(expr, out) {
		if (expr.type === "call") {
			if (expr.callee.type === "identifier") out.add(expr.callee.name);
			collectCalleeNamesFromBody(expr.callee, out);
			for (const a$1 of expr.args) if (a$1.type === "arg") collectCalleeNamesFromBody(a$1.value, out);
			return;
		}
		switch (expr.type) {
			case "number":
			case "string":
			case "identifier": return;
			case "fn":
				if (expr.body.type === "block") for (const s$1 of expr.body.body) collectCalleeNamesFromStmt(s$1, out);
				else collectCalleeNamesFromBody(expr.body, out);
				return;
			case "array":
				for (const it of expr.items) collectCalleeNamesFromBody(it, out);
				return;
			case "index":
				collectCalleeNamesFromBody(expr.object, out);
				collectCalleeNamesFromBody(expr.index, out);
				return;
			case "member":
				collectCalleeNamesFromBody(expr.object, out);
				return;
			case "unary":
				collectCalleeNamesFromBody(expr.expr, out);
				return;
			case "binary":
				collectCalleeNamesFromBody(expr.left, out);
				collectCalleeNamesFromBody(expr.right, out);
				return;
			case "ternary":
				collectCalleeNamesFromBody(expr.test, out);
				collectCalleeNamesFromBody(expr.then, out);
				collectCalleeNamesFromBody(expr.else, out);
				return;
			case "assign":
				collectCalleeNamesFromBody(expr.left, out);
				collectCalleeNamesFromBody(expr.right, out);
				return;
			case "destructure": return;
		}
	}
	function collectCalleeNamesFromStmt(stmt, out) {
		if (stmt.type === "expr") return collectCalleeNamesFromBody(stmt.expr, out);
		if (stmt.type === "block") {
			for (const s$1 of stmt.body) collectCalleeNamesFromStmt(s$1, out);
			return;
		}
		const withTest = stmt;
		if (withTest.test) collectCalleeNamesFromBody(withTest.test, out);
		if (withTest.then) collectCalleeNamesFromStmt(withTest.then, out);
		if (withTest.else) collectCalleeNamesFromStmt(withTest.else, out);
		if (withTest.body) collectCalleeNamesFromStmt(withTest.body, out);
		if (withTest.from) collectCalleeNamesFromBody(withTest.from, out);
		if (withTest.to) collectCalleeNamesFromBody(withTest.to, out);
		if (withTest.iterable) collectCalleeNamesFromBody(withTest.iterable, out);
		const withValue = stmt;
		if (withValue.value && typeof withValue.value === "object" && "type" in withValue.value) collectCalleeNamesFromBody(withValue.value, out);
	}
	function addCallSiteToSampleRegistrations(state, handle, scopeId, seconds) {
		if (!state.sampleRegistrations.some((reg) => reg.type === "record" && reg.recordCallbackId === scopeId && reg.handle === handle && reg.recordSeconds === seconds)) state.sampleRegistrations.push({
			handle,
			type: "record",
			recordSeconds: seconds,
			recordCallbackId: scopeId
		});
	}
	function processRecordCall(state, callExpr, callbackId, templateLocKey) {
		const args = callExpr.args;
		if (args.length !== 2) {
			error(state, "record() requires exactly 2 arguments: seconds and callback", callExpr.loc);
			return;
		}
		const secondsArg = args[0]?.type === "arg" ? args[0].value : null;
		const callbackArg = args[1]?.type === "arg" ? args[1].value : null;
		if (!secondsArg || secondsArg.type !== "number") {
			error(state, "record() seconds must be a literal number", callExpr.loc);
			return;
		}
		let callbackFn;
		if (callbackArg?.type === "identifier") {
			if (!getFunctionByName(state, callbackArg.name)) {
				error(state, `record() callback must be a function, but '${callbackArg.name}' is not a function`, callExpr.loc);
				return;
			}
			callbackFn = {
				type: "fn",
				params: [],
				defaults: [],
				body: {
					type: "call",
					callee: callbackArg,
					args: [],
					loc: callbackArg.loc
				},
				loc: callbackArg.loc
			};
		} else if (callbackArg?.type === "fn") callbackFn = callbackArg;
		else {
			error(state, "record() callback must be a function expression or function reference", callExpr.loc);
			return;
		}
		const seconds = Math.max(0, Math.min(10, secondsArg.value));
		const scopeId = callbackId !== -1 ? callbackId : state.nextRecordScopeId++;
		const capturedVars = detectCapturedVarsInBody(state, callbackFn.body);
		const calleeNames = /* @__PURE__ */ new Set();
		if (callbackFn.body.type === "block") for (const s$1 of callbackFn.body.body) collectCalleeNamesFromStmt(s$1, calleeNames);
		else collectCalleeNamesFromBody(callbackFn.body, calleeNames);
		const savedOps = state.ops;
		const savedStack = state.stack;
		const savedLocals = state.locals;
		const savedClosureVars = state.closureVars;
		const savedGlobals = new Map(state.globals);
		const resolveToCanonical = (n$1) => state.functionAliases.get(n$1) ?? n$1;
		const isPreludeFunction = (info) => info.definitionLine != null && info.definitionLine <= state.preludeLines;
		const hasGlobalFnCache = /* @__PURE__ */ new Map();
		const hasGlobalFn = (name) => {
			if (hasGlobalFnCache.has(name)) return hasGlobalFnCache.get(name);
			const v$1 = hasGlobalFunctionByName(state, name);
			hasGlobalFnCache.set(name, v$1);
			return v$1;
		};
		const globalFnMap = state.functionsByNameStack[0];
		const funcIdToGlobalName = /* @__PURE__ */ new Map();
		for (const [name, info] of globalFnMap) funcIdToGlobalName.set(info.id, name);
		const canonicalToAliases = /* @__PURE__ */ new Map();
		for (const [alias, target] of state.functionAliases) {
			const existing = canonicalToAliases.get(target);
			if (existing) existing.push(alias);
			else canonicalToAliases.set(target, [alias]);
		}
		const requiredNames = new Set(calleeNames);
		const indexToName = /* @__PURE__ */ new Map();
		for (const [name, info] of savedGlobals) if (info.scope === "global") indexToName.set(info.index, name);
		const requiredQueue = Array.from(requiredNames);
		const enqueueRequired = (name) => {
			if (requiredNames.has(name)) return;
			requiredNames.add(name);
			requiredQueue.push(name);
		};
		const enqueueCanonicalIfGlobal = (name) => {
			const canonical = resolveToCanonical(name);
			if (canonical !== name && hasGlobalFn(canonical)) enqueueRequired(canonical);
		};
		const tmpCallees = /* @__PURE__ */ new Set();
		while (requiredQueue.length > 0) {
			const name = requiredQueue.pop();
			enqueueCanonicalIfGlobal(name);
			const funcInfo = globalFnMap.get(name);
			if (!funcInfo) continue;
			for (const defaultExpr of funcInfo.defaultParamExprs ?? []) {
				if (!defaultExpr) continue;
				tmpCallees.clear();
				collectCalleeNamesFromBody(defaultExpr, tmpCallees);
				for (const callee of tmpCallees) {
					enqueueRequired(callee);
					enqueueCanonicalIfGlobal(callee);
				}
			}
			const bytecode = state.functionBytecodes.get(funcInfo.id);
			if (!bytecode) continue;
			const indices = /* @__PURE__ */ new Set();
			collectGlobalIndicesFromOps(bytecode, 0, bytecode.length, indices);
			for (const idx of indices) {
				const refName = indexToName.get(idx);
				if (!refName) continue;
				const canonical = resolveToCanonical(refName) ?? refName;
				if (hasGlobalFn(canonical)) enqueueRequired(canonical);
			}
		}
		const defaultParamFnToRecordGlobal = /* @__PURE__ */ new Map();
		const enclosingDefaultParamNameToSlot = /* @__PURE__ */ new Map();
		const enclosingDefaultParams = state.currentFunctionId !== null ? state.functionIdToDefaultParamFunctions.get(state.currentFunctionId) : void 0;
		if (enclosingDefaultParams) for (const [paramName, defaultFnId] of enclosingDefaultParams) {
			const recordGlobalIdx = state.nextRecordGlobalIdx++;
			defaultParamFnToRecordGlobal.set(defaultFnId, recordGlobalIdx);
			enclosingDefaultParamNameToSlot.set(paramName, recordGlobalIdx);
		}
		for (const funcInfo of state.functions) {
			const fnName = funcIdToGlobalName.get(funcInfo.id);
			const isRequired = fnName !== void 0 && requiredNames.has(fnName);
			const isPrelude = isPreludeFunction(funcInfo);
			if (!isRequired && !isPrelude) continue;
			const thisDefaultParams = state.functionIdToDefaultParamFunctions.get(funcInfo.id);
			if (!thisDefaultParams) continue;
			for (const [paramName, defaultFnId] of thisDefaultParams) {
				if (defaultParamFnToRecordGlobal.has(defaultFnId)) continue;
				const recordGlobalIdx = state.nextRecordGlobalIdx++;
				defaultParamFnToRecordGlobal.set(defaultFnId, recordGlobalIdx);
			}
		}
		const dependencies = [];
		const recordGlobalIndices = [];
		const capturedVarMapping = /* @__PURE__ */ new Map();
		const scalarCaptureSources = [];
		for (const { name, info } of capturedVars) {
			const canonical = resolveToCanonical(name);
			if (hasGlobalFn(name) || hasGlobalFn(canonical)) continue;
			if (calleeNames.has(name) && info.scope === "global") continue;
			if (info.scope === "local" && enclosingDefaultParamNameToSlot.has(name)) {
				const recordGlobalIdx$1 = enclosingDefaultParamNameToSlot.get(name);
				dependencies.push({
					name,
					scope: info.scope,
					sourceIndex: info.index
				});
				recordGlobalIndices.push(recordGlobalIdx$1);
				capturedVarMapping.set(name, recordGlobalIdx$1);
				scalarCaptureSources.push({
					scope: info.scope,
					sourceIndex: info.index
				});
				continue;
			}
			const recordGlobalIdx = state.nextRecordGlobalIdx++;
			if (calleeNames.has(name) && (info.scope === "local" || info.scope === "closure")) {
				dependencies.push({
					name,
					scope: info.scope,
					sourceIndex: info.index
				});
				recordGlobalIndices.push(recordGlobalIdx);
				capturedVarMapping.set(name, recordGlobalIdx);
				continue;
			}
			dependencies.push({
				name,
				scope: info.scope,
				sourceIndex: info.index
			});
			recordGlobalIndices.push(recordGlobalIdx);
			capturedVarMapping.set(name, recordGlobalIdx);
			scalarCaptureSources.push({
				scope: info.scope,
				sourceIndex: info.index
			});
		}
		for (const funcInfo of state.functions) {
			const fnName = funcIdToGlobalName.get(funcInfo.id);
			if (!(fnName !== void 0 && requiredNames.has(fnName) || defaultParamFnToRecordGlobal.has(funcInfo.id)) || !(funcInfo.closureVars?.length ?? 0)) continue;
			for (const name of funcInfo.closureVars) {
				if (capturedVarMapping.has(name)) continue;
				const info = savedGlobals.get(name);
				if (info?.scope !== "global") continue;
				const recordGlobalIdx = state.nextRecordGlobalIdx++;
				const canonical = resolveToCanonical(name);
				dependencies.push({
					name,
					scope: "global",
					sourceIndex: info.index
				});
				recordGlobalIndices.push(recordGlobalIdx);
				capturedVarMapping.set(name, recordGlobalIdx);
				if (hasGlobalFn(name) || hasGlobalFn(canonical)) continue;
				scalarCaptureSources.push({
					scope: "global",
					sourceIndex: info.index
				});
			}
		}
		let captureStoreGlobalIdx = 0;
		const captureOps = [];
		state.locals = [/* @__PURE__ */ new Map()];
		state.closureVars = [];
		state.globals = new Map(savedGlobals);
		for (const [name, destGlobalIdx] of capturedVarMapping) state.globals.set(name, {
			scope: "global",
			index: destGlobalIdx
		});
		const loopOps = [];
		state.ops = loopOps;
		state.stack = [];
		state.compilingRecordCallback = true;
		if (callbackFn.body.type === "block") compileFunctionBlock(state, callbackFn.body);
		else compileExpr(state, callbackFn.body);
		if (state.stack.length > 0) {
			loopOps.push(AudioVmOp.Solo);
			loopOps.push(1);
			state.stack.pop();
		}
		loopOps.push(AudioVmOp.Post);
		state.compilingRecordCallback = false;
		const loopBytecode = encodeCallbackBytecode(loopOps);
		const numDepsFinal = scalarCaptureSources.length;
		if (callbackId !== -1) {
			if (!state.scopeCaptureGlobals.has(scopeId)) {
				captureStoreGlobalIdx = state.nextGlobalIndex++;
				state.scopeCaptureGlobals.set(scopeId, captureStoreGlobalIdx);
				state.arrayInitRequests.push({
					capacity: Math.max(1, numDepsFinal),
					globalIdx: captureStoreGlobalIdx
				});
			} else captureStoreGlobalIdx = state.scopeCaptureGlobals.get(scopeId);
			for (let depIndex = 0; depIndex < scalarCaptureSources.length; depIndex++) {
				const { scope, sourceIndex } = scalarCaptureSources[depIndex];
				captureOps.push(AudioVmOp.GetGlobal, captureStoreGlobalIdx, AudioVmOp.PushScalar, depIndex);
				if (scope === "global") captureOps.push(AudioVmOp.GetGlobal, sourceIndex);
				else if (scope === "local") captureOps.push(AudioVmOp.GetLocal, sourceIndex);
				else captureOps.push(AudioVmOp.GetClosure, sourceIndex);
				captureOps.push(AudioVmOp.ArraySet);
			}
		}
		const setupOps = [];
		state.stack = [];
		let maxSetupGlobalIndex = -1;
		for (const funcInfo of state.functions) {
			const fnName = funcIdToGlobalName.get(funcInfo.id);
			if (!(fnName !== void 0 && requiredNames.has(fnName) || defaultParamFnToRecordGlobal.has(funcInfo.id)) && !isPreludeFunction(funcInfo)) continue;
			const funcBytecode = state.functionBytecodes.get(funcInfo.id);
			if (!funcBytecode) continue;
			const closureCount = funcInfo.closureVars ? funcInfo.closureVars.length : 0;
			if (closureCount > 0) {
				const dummyCellRefGlobalIdx = 0;
				const thisDefaultParams = state.functionIdToDefaultParamFunctions.get(funcInfo.id);
				for (const name of funcInfo.closureVars) {
					const info = savedGlobals.get(name);
					const defaultFnId = thisDefaultParams?.get(name);
					let idx;
					if (defaultFnId !== void 0 && defaultParamFnToRecordGlobal.has(defaultFnId)) idx = defaultParamFnToRecordGlobal.get(defaultFnId);
					else if (capturedVarMapping.has(name)) idx = capturedVarMapping.get(name);
					else if (info?.scope === "global") idx = info.index;
					else idx = dummyCellRefGlobalIdx;
					if (idx > maxSetupGlobalIndex) maxSetupGlobalIndex = idx;
					setupOps.push(AudioVmOp.GetCellRefGlobal);
					setupOps.push(idx);
				}
			}
			setupOps.push(AudioVmOp.DefineFunction);
			setupOps.push(funcInfo.id);
			setupOps.push(funcInfo.paramCount);
			setupOps.push(funcInfo.firstParamIn);
			setupOps.push(closureCount);
			setupOps.push(funcInfo.localCount ?? 0);
			setupOps.push(funcBytecode.length);
			for (let k$1 = 0; k$1 < funcBytecode.length; k$1++) setupOps.push(funcBytecode[k$1]);
			const recordGlobalForDefaultParam = defaultParamFnToRecordGlobal.get(funcInfo.id);
			if (!fnName) {
				if (recordGlobalForDefaultParam !== void 0) {
					if (recordGlobalForDefaultParam > maxSetupGlobalIndex) maxSetupGlobalIndex = recordGlobalForDefaultParam;
					setupOps.push(AudioVmOp.SetGlobal);
					setupOps.push(recordGlobalForDefaultParam);
				} else setupOps.push(AudioVmOp.Pop);
				continue;
			}
			const targetNames = [fnName].concat(canonicalToAliases.get(fnName) ?? []);
			const indicesToSet = [];
			for (const name of targetNames) {
				const globalInfo = savedGlobals.get(name);
				if (globalInfo?.scope === "global") indicesToSet.push(globalInfo.index);
				const capturedIdx = capturedVarMapping.get(name);
				if (capturedIdx !== void 0) indicesToSet.push(capturedIdx);
			}
			for (let i$1 = 0; i$1 < indicesToSet.length; i$1++) {
				if (i$1 < indicesToSet.length - 1) setupOps.push(AudioVmOp.Dup);
				const idx = indicesToSet[i$1];
				if (idx > maxSetupGlobalIndex) maxSetupGlobalIndex = idx;
				setupOps.push(AudioVmOp.SetGlobal);
				setupOps.push(idx);
			}
		}
		const setupBytecode = encodeCallbackBytecode(setupOps);
		const maxSetupGlobalIndexFinal = maxSetupGlobalIndex >= 0 ? maxSetupGlobalIndex : void 0;
		state.globals = savedGlobals;
		state.locals = savedLocals;
		state.closureVars = savedClosureVars;
		const defaultParamRecordGlobals = defaultParamFnToRecordGlobal.size > 0 ? Array.from(defaultParamFnToRecordGlobal.values()) : void 0;
		const recordCallbackPayload = {
			setup: setupBytecode,
			loop: loopBytecode,
			dependencies,
			recordGlobalIndices,
			captureStoreGlobalIdx,
			defaultParamRecordGlobals,
			maxSetupGlobalIndex: maxSetupGlobalIndexFinal
		};
		if (callbackId !== -1) state.recordCallbacks.set(callbackId, recordCallbackPayload);
		else if (templateLocKey !== void 0) state.recordCallbackTemplates.set(templateLocKey, recordCallbackPayload);
		state.ops = savedOps;
		state.stack = savedStack;
		if (callbackId !== -1) state.ops.push(...captureOps);
		let handle;
		if (callbackId === -1) handle = 0;
		else {
			handle = sampleManager.registerRecord(state.projectId, seconds, scopeId);
			state.sampleRegistrations.push({
				handle,
				type: "record",
				recordSeconds: seconds,
				recordCallbackId: scopeId
			});
			state.ops.push(AudioVmOp.Pop);
			state.ops.push(AudioVmOp.Pop);
			if (state.stack.length >= 2) {
				state.stack.pop();
				state.stack.pop();
			}
			state.ops.push(AudioVmOp.PushScalar);
			state.ops.push(handle);
		}
		state.stack.push({ expr: callExpr });
	}
	function processRecordCallSite(state, callExpr, funcName, funcInfo, callSiteId) {
		const recordCallLocKey = state.functionToRecordCall.get(funcName);
		if (!recordCallLocKey) return;
		const recordCallExpr = state.recordCallExprs.get(recordCallLocKey);
		if (!recordCallExpr) return;
		const args = recordCallExpr.args;
		const secondsArg = args[0]?.type === "arg" ? args[0].value : null;
		if (!secondsArg || secondsArg.type !== "number") return;
		const seconds = Math.max(0, Math.min(10, secondsArg.value));
		const handle = sampleManager.registerRecord(state.projectId, seconds, callSiteId);
		const template = state.recordCallbackTemplates.get(recordCallLocKey);
		if (!template) return;
		const scopeId = callSiteId;
		if (state.recordCaptureStoresByScopeGlobal === null) state.recordCaptureStoresByScopeGlobal = state.nextGlobalIndex++;
		const captureStoreGlobalIdx = state.recordCaptureStoresByScopeGlobal;
		if (state.currentRecordScopeIdGlobal !== null) state.ops.push(AudioVmOp.PushScalar, scopeId, AudioVmOp.SetGlobal, state.currentRecordScopeIdGlobal);
		if (state.recordHandleByScopeGlobal !== null) {
			state.callSiteIdToHandle.set(scopeId, handle);
			state.ops.push(AudioVmOp.GetGlobal, state.recordHandleByScopeGlobal, AudioVmOp.PushScalar, scopeId, AudioVmOp.PushScalar, handle, AudioVmOp.ArraySet);
		}
		state.recordCallbacks.set(scopeId, {
			...template,
			captureStoreGlobalIdx,
			useNestedCaptureStore: true
		});
		addCallSiteToSampleRegistrations(state, handle, scopeId, seconds);
	}
	function compileRecord(state, callExpr) {
		const locKey = `${callExpr.loc.line}:${callExpr.loc.column}:${callExpr.loc.start}:${callExpr.loc.end}`;
		const callbackId = state.recordCallIds.get(locKey);
		if (callbackId === void 0) {
			state.recordCallExprs.set(locKey, callExpr);
			const args = callExpr.args;
			const secondsArg = args[0]?.type === "arg" ? args[0].value : null;
			const callbackArg = args[1]?.type === "arg" ? args[1].value : null;
			if (!secondsArg || secondsArg.type !== "number") {
				error(state, "record() seconds must be a literal number", callExpr.loc);
				return;
			}
			if (!callbackArg) {
				error(state, "record() requires exactly 2 arguments: seconds and callback", callExpr.loc);
				return;
			}
			const opsBeforeRecord = state.ops.length;
			compileExpr(state, secondsArg);
			compileExpr(state, callbackArg);
			processRecordCall(state, callExpr, -1, locKey);
			if (state.recordHandleByScopeGlobal === null) {
				state.recordHandleByScopeGlobal = state.nextGlobalIndex++;
				const maxScopeId = state.recordCallIds.size > 0 ? Math.max(...state.recordCallIds.values()) : 0;
				const capacity = Math.max(100, maxScopeId + 1);
				state.arrayInitRequests.push({
					capacity,
					globalIdx: state.recordHandleByScopeGlobal
				});
			}
			if (state.currentRecordScopeIdGlobal === null) state.currentRecordScopeIdGlobal = state.nextGlobalIndex++;
			const tempCallbackData = state.recordCallbackTemplates.get(locKey);
			state.ops.length = opsBeforeRecord;
			state.ops.push(AudioVmOp.Pop);
			state.ops.push(AudioVmOp.Pop);
			if (state.recordCaptureStoresByScopeGlobal === null) state.recordCaptureStoresByScopeGlobal = state.nextGlobalIndex++;
			if (state.recordHandleByScopeGlobal !== null && state.currentRecordScopeIdGlobal !== null) state.ops.push(AudioVmOp.GetGlobal, state.recordHandleByScopeGlobal, AudioVmOp.GetGlobal, state.currentRecordScopeIdGlobal, AudioVmOp.ArrayGet, 0);
			else state.ops.push(AudioVmOp.PushScalar, 0);
			if (tempCallbackData && state.recordCaptureStoresByScopeGlobal !== null && state.currentRecordScopeIdGlobal !== null) for (let depIndex = 0; depIndex < tempCallbackData.dependencies.length; depIndex++) {
				const dep = tempCallbackData.dependencies[depIndex];
				state.ops.push(AudioVmOp.GetGlobal, state.recordCaptureStoresByScopeGlobal, AudioVmOp.GetGlobal, state.currentRecordScopeIdGlobal, AudioVmOp.ArrayGet);
				state.ops.push(AudioVmOp.Dup);
				state.ops.push(AudioVmOp.PushScalar, depIndex);
				if (dep.scope === "global") state.ops.push(AudioVmOp.GetGlobal, dep.sourceIndex);
				else if (dep.scope === "local") state.ops.push(AudioVmOp.GetLocal, dep.sourceIndex);
				else state.ops.push(AudioVmOp.GetClosure, dep.sourceIndex);
				state.ops.push(AudioVmOp.ArraySet);
			}
			return;
		}
		processRecordCall(state, callExpr, callbackId);
	}
	const TIMELINE_MAGIC = 1e3;
	const TIMELINE_HEADER_SIZE = 4;
	const TIMELINE_SEGMENT_SIZE = 5;
	const TIMELINE_KIND_HOLD = 0;
	const TIMELINE_KIND_GLIDE = 1;
	const numRe = "[+-]?(?:\\d+(?:\\.\\d*)?|\\.\\d+)";
	const pointTokenRe = /* @__PURE__ */ new RegExp(`^(${numRe}),(${numRe})(?:([e])(${numRe})?)?$`);
	function tokenizeTimelineNotation(input) {
		const tokens = [];
		let index = 0;
		let i$1 = 0;
		while (i$1 < input.length) {
			while (i$1 < input.length && /\s/.test(input[i$1])) i$1++;
			if (i$1 >= input.length) break;
			const start = i$1;
			while (i$1 < input.length && !/\s/.test(input[i$1])) i$1++;
			const end = i$1;
			tokens.push({
				index,
				start,
				length: end - start,
				text: input.slice(start, end)
			});
			index++;
		}
		return tokens;
	}
	function parseTimelineNotation(tokens) {
		const points = [];
		for (const t$1 of tokens) {
			const m$1 = pointTokenRe.exec(t$1.text);
			if (!m$1) continue;
			const barUser = Number(m$1[1] ?? 0);
			const bar = barUser >= 1 ? barUser - 1 : 0;
			const value = Number(m$1[2] ?? 0);
			const curveKind = m$1[3] ?? null;
			const curveValue = Number(m$1[4] ?? 0);
			const exp = curveKind === "e" ? curveValue : null;
			if (!Number.isFinite(bar) || !Number.isFinite(value)) continue;
			points.push({
				bar,
				value,
				exp,
				tokenIndex: t$1.index,
				tokenStart: t$1.start,
				tokenLength: t$1.length
			});
		}
		return points;
	}
	function compilePoints(points) {
		if (points.length === 0) return {
			segments: [],
			totalBars: 0,
			endValue: 0,
			endTokenIndex: -1,
			endTokenStart: -1,
			endTokenLength: -1
		};
		const pts = points.map((p$1) => ({
			...p$1,
			bar: p$1.bar
		})).filter((p$1) => p$1.bar >= 0);
		if (pts.length === 0) return {
			segments: [],
			totalBars: 0,
			endValue: 0,
			endTokenIndex: -1,
			endTokenStart: -1,
			endTokenLength: -1
		};
		if (!pts.some((p$1) => p$1.bar === 0)) pts.unshift({
			bar: 0,
			value: 0,
			exp: null,
			tokenIndex: -1,
			tokenStart: -1,
			tokenLength: -1
		});
		const segments = [];
		let i$1 = 0;
		let t$1 = 0;
		let v$1 = pts[0].value;
		let activeTokenIndex = pts[0].tokenIndex;
		let activeTokenStart = pts[0].tokenStart;
		let activeTokenLength = pts[0].tokenLength;
		while (i$1 < pts.length && pts[i$1].bar === 0) {
			v$1 = pts[i$1].value;
			activeTokenIndex = pts[i$1].tokenIndex;
			activeTokenStart = pts[i$1].tokenStart;
			activeTokenLength = pts[i$1].tokenLength;
			i$1++;
		}
		let endTokenIndex = activeTokenIndex;
		let endTokenStart = activeTokenStart;
		let endTokenLength = activeTokenLength;
		for (; i$1 < pts.length; i$1++) {
			const p$1 = pts[i$1];
			const nextT = p$1.bar;
			const nextV = p$1.value;
			const dt = nextT - t$1;
			if (dt < 0) continue;
			if (dt === 0) {
				t$1 = nextT;
				v$1 = nextV;
				activeTokenIndex = p$1.tokenIndex;
				activeTokenStart = p$1.tokenStart;
				activeTokenLength = p$1.tokenLength;
				endTokenIndex = activeTokenIndex;
				endTokenStart = activeTokenStart;
				endTokenLength = activeTokenLength;
				continue;
			}
			const exp = p$1.exp ?? 1;
			const kind = v$1 === nextV ? TIMELINE_KIND_HOLD : TIMELINE_KIND_GLIDE;
			segments.push({
				kind,
				durBars: dt,
				startValue: v$1,
				endValue: nextV,
				exp,
				fromTokenIndex: activeTokenIndex,
				fromTokenStart: activeTokenStart,
				fromTokenLength: activeTokenLength,
				toTokenIndex: p$1.tokenIndex,
				toTokenStart: p$1.tokenStart,
				toTokenLength: p$1.tokenLength
			});
			t$1 = nextT;
			v$1 = nextV;
			activeTokenIndex = p$1.tokenIndex;
			activeTokenStart = p$1.tokenStart;
			activeTokenLength = p$1.tokenLength;
			endTokenIndex = activeTokenIndex;
			endTokenStart = activeTokenStart;
			endTokenLength = activeTokenLength;
		}
		let totalBars = t$1;
		if (totalBars <= 0) {
			totalBars = 1;
			segments.push({
				kind: TIMELINE_KIND_HOLD,
				durBars: 1,
				startValue: v$1,
				endValue: v$1,
				exp: 1,
				fromTokenIndex: activeTokenIndex,
				fromTokenStart: activeTokenStart,
				fromTokenLength: activeTokenLength,
				toTokenIndex: activeTokenIndex,
				toTokenStart: activeTokenStart,
				toTokenLength: activeTokenLength
			});
		}
		return {
			segments,
			totalBars,
			endValue: v$1,
			endTokenIndex,
			endTokenStart,
			endTokenLength
		};
	}
	const cacheBySequence = /* @__PURE__ */ new Map();
	function compileTimelineNotation(input, initialBeatDiv = 4) {
		const cached = cacheBySequence.get(input);
		if (cached) return cached;
		if (cacheBySequence.size > 1e3) cacheBySequence.clear();
		const tokens = tokenizeTimelineNotation(input);
		const noWrap = tokens.some((t$1) => t$1.text === "-");
		const compiled = compilePoints(parseTimelineNotation(tokens));
		const segments = compiled.segments;
		let totalBars = compiled.totalBars;
		if (noWrap && segments.length > 0) {
			const last = segments[segments.length - 1];
			if ((last.kind === TIMELINE_KIND_GLIDE ? last.endValue : last.startValue) !== compiled.endValue) segments.push({
				kind: TIMELINE_KIND_HOLD,
				durBars: 1,
				startValue: compiled.endValue,
				endValue: compiled.endValue,
				exp: 1,
				fromTokenIndex: compiled.endTokenIndex,
				fromTokenStart: compiled.endTokenStart,
				fromTokenLength: compiled.endTokenLength,
				toTokenIndex: compiled.endTokenIndex,
				toTokenStart: compiled.endTokenStart,
				toTokenLength: compiled.endTokenLength
			});
		}
		const beatsPerBar = initialBeatDiv > 0 ? initialBeatDiv : 4;
		const segCount = segments.length;
		const opLength = TIMELINE_HEADER_SIZE + segCount * TIMELINE_SEGMENT_SIZE;
		const bytecode = new Float32Array(1 + opLength);
		bytecode[0] = opLength;
		bytecode[1] = TIMELINE_MAGIC;
		bytecode[2] = segCount;
		bytecode[3] = noWrap ? -totalBars : totalBars;
		bytecode[4] = beatsPerBar;
		let o$1 = 1 + TIMELINE_HEADER_SIZE;
		for (const s$1 of segments) {
			bytecode[o$1++] = s$1.kind;
			bytecode[o$1++] = s$1.durBars;
			bytecode[o$1++] = s$1.startValue;
			bytecode[o$1++] = s$1.endValue;
			bytecode[o$1++] = s$1.exp;
		}
		const result = {
			bytecode,
			tokens: segments.map((s$1) => ({
				fromTokenIndex: s$1.fromTokenIndex,
				fromTokenStart: s$1.fromTokenStart,
				fromTokenLength: s$1.fromTokenLength,
				toTokenIndex: s$1.toTokenIndex,
				toTokenStart: s$1.toTokenStart,
				toTokenLength: s$1.toTokenLength
			})),
			segments
		};
		cacheBySequence.set(input, result);
		return result;
	}
	function compileTimeline(state, callExpr, args) {
		let seqExpr = null;
		let colorExpr = null;
		for (const arg of args) if (arg.type === "arg" && arg.value) {
			if (arg.name === "pattern" || arg.name === "seq" || arg.name === "sequence") seqExpr = arg.value;
			else if (arg.name === "color") colorExpr = arg.value;
			else if (!arg.name) {
				if (!seqExpr) seqExpr = arg.value;
				else if (!colorExpr) colorExpr = arg.value;
			}
		}
		if (!seqExpr) {
			error(state, "timeline() requires a pattern string argument", callExpr.loc);
			return;
		}
		if (seqExpr.type !== "string") {
			error(state, "timeline() pattern argument must be a string literal", callExpr.loc);
			return;
		}
		let colorIndex;
		if (colorExpr) {
			if (colorExpr.type !== "number") {
				error(state, "timeline() color argument must be a number 0-5 (red,green,yellow,blue,purple,cyan)", callExpr.loc);
				return;
			}
			const n$1 = Math.floor(Number(colorExpr.value));
			if (n$1 < 0 || n$1 > 5) {
				error(state, "timeline() color argument must be 0-5", callExpr.loc);
				return;
			}
			colorIndex = n$1;
		}
		const sequence = seqExpr.value;
		const compiled = compileTimelineNotation(sequence);
		if (compiled.bytecode.length <= 1) {
			error(state, "timeline() pattern is empty or invalid", callExpr.loc);
			return;
		}
		const bytecodeLength = compiled.bytecode.length;
		const pc = state.ops.length;
		if (callExpr.loc.line > state.preludeLines) {
			const historyEntry = {
				line: callExpr.loc.line - state.preludeLines,
				column: callExpr.loc.column,
				genName: "Timeline",
				pc: state.inFunction ? 0 : pc,
				inFunction: state.inFunction,
				__fromMainProgram: !state.isDeferredPass,
				sequence,
				timelineSegmentTokens: compiled.tokens.map((t$1) => ({
					fromTokenStart: t$1.fromTokenStart,
					fromTokenLength: t$1.fromTokenLength,
					toTokenStart: t$1.toTokenStart,
					toTokenLength: t$1.toTokenLength
				})),
				...colorIndex !== void 0 && { timelineColorIndex: colorIndex }
			};
			state.historySourceMap.push(historyEntry);
			if (state.inFunction && state.currentFunctionId !== null) {
				historyEntry.__functionId = state.currentFunctionId;
				historyEntry.__relativePc = pc;
			} else historyEntry.pc = pc;
		}
		state.ops.push(AudioVmOp.Timeline);
		state.ops.push(bytecodeLength);
		for (let i$1 = 0; i$1 < bytecodeLength; i$1++) state.ops.push(compiled.bytecode[i$1]);
		state.stack.push({ expr: callExpr });
	}
	function parseTramSequence(sequence) {
		const bytecode = [];
		const beatMapping = [];
		let i$1 = 0;
		let linearIndex = 0;
		const parseSubsequenceInto = (target, startCharIndex) => {
			let beatCount = 0;
			let charIndex = startCharIndex;
			const startLinearIndex = linearIndex;
			while (i$1 < sequence.length) {
				const ch = sequence[i$1];
				const charStart = charIndex;
				if (ch === "X") {
					target.push(2);
					beatMapping.push({
						linearIndex: linearIndex++,
						startCol: charStart + 1,
						endCol: charStart + 2
					});
					beatCount++;
					i$1++;
					charIndex++;
				} else if (ch === "x") {
					target.push(1);
					beatMapping.push({
						linearIndex: linearIndex++,
						startCol: charStart + 1,
						endCol: charStart + 2
					});
					beatCount++;
					i$1++;
					charIndex++;
				} else if (ch === ".") {
					target.push(.5);
					beatMapping.push({
						linearIndex: linearIndex++,
						startCol: charStart + 1,
						endCol: charStart + 2
					});
					beatCount++;
					i$1++;
					charIndex++;
				} else if (ch === "-") {
					target.push(0);
					beatMapping.push({
						linearIndex: linearIndex++,
						startCol: charStart + 1,
						endCol: charStart + 2
					});
					beatCount++;
					i$1++;
					charIndex++;
				} else if (ch === "[") {
					i$1++;
					charIndex++;
					target.push(-1);
					const subContent = [];
					const subResult = parseSubsequenceInto(subContent, charIndex);
					const subBeatCount = subResult.beatCount;
					target.push(subBeatCount);
					target.push(...subContent);
					beatCount++;
					charIndex = subResult.endCharIndex;
				} else if (ch === "]") {
					i$1++;
					charIndex++;
					break;
				} else {
					i$1++;
					charIndex++;
				}
			}
			return {
				beatCount,
				endCharIndex: charIndex,
				linearIndex: linearIndex - startLinearIndex
			};
		};
		parseSubsequenceInto(bytecode, 0);
		return {
			bytecode,
			beatMapping
		};
	}
	function compileTram(state, callExpr, args) {
		let seqExpr = null;
		let barsExpr = null;
		for (const arg of args) if (arg.type === "arg" && arg.value) {
			if (arg.name === "seq" || arg.name === "sequence") seqExpr = arg.value;
			else if (arg.name === "bars") barsExpr = arg.value;
			else if (!arg.name && !seqExpr) seqExpr = arg.value;
			else if (!arg.name && !barsExpr) barsExpr = arg.value;
		}
		if (!seqExpr) {
			error(state, "tram() requires a sequence string argument", callExpr.loc.line, callExpr.loc.column);
			return;
		}
		if (seqExpr.type !== "string") {
			error(state, "tram() sequence argument must be a string literal", callExpr.loc.line, callExpr.loc.column);
			return;
		}
		const sequence = seqExpr.value;
		const parseResult = parseTramSequence(sequence);
		if (parseResult.bytecode.length === 0) {
			error(state, "tram() sequence is empty", callExpr.loc.line, callExpr.loc.column);
			return;
		}
		if (barsExpr) compileExpr(state, barsExpr);
		else {
			state.ops.push(AudioVmOp.PushScalar);
			state.ops.push(1);
			state.stack.push({ expr: {
				type: "number",
				value: 1,
				loc: callExpr.loc
			} });
		}
		const pc = state.ops.length;
		if (callExpr.loc.line > state.preludeLines) {
			const historyEntry = {
				line: callExpr.loc.line - state.preludeLines,
				column: callExpr.loc.column,
				genName: "Tram",
				pc: state.inFunction ? 0 : pc,
				inFunction: state.inFunction,
				__fromMainProgram: !state.isDeferredPass,
				tramBeatMapping: parseResult.beatMapping.map((m$1) => ({
					linearIndex: m$1.linearIndex,
					startCol: seqExpr.loc.column + m$1.startCol,
					endCol: seqExpr.loc.column + m$1.endCol
				}))
			};
			state.historySourceMap.push(historyEntry);
			if (state.inFunction && state.currentFunctionId !== null) {
				historyEntry.__functionId = state.currentFunctionId;
				historyEntry.__relativePc = pc;
			} else historyEntry.pc = pc;
		}
		const bytecode = parseResult.bytecode;
		const tramLen = bytecode.length;
		if (!Number.isInteger(tramLen) || tramLen <= 0) {
			error(state, "tram() bytecode length invalid", callExpr.loc.line, callExpr.loc.column);
			return;
		}
		for (let b$1 = 0; b$1 < tramLen; b$1++) {
			const v$1 = bytecode[b$1];
			if (typeof v$1 !== "number" || !Number.isFinite(v$1)) {
				error(state, "tram() bytecode contains invalid value", callExpr.loc.line, callExpr.loc.column);
				return;
			}
		}
		state.ops.push(AudioVmOp.Tram);
		state.ops.push(tramLen);
		state.ops.push(...bytecode);
		state.stack.pop();
		state.stack.push({ expr: callExpr });
	}
	const MATH_UNARY = [
		"sin",
		"cos",
		"tan",
		"asin",
		"acos",
		"atan",
		"tanh",
		"abs",
		"sqrt",
		"square",
		"cube",
		"log",
		"exp",
		"log10",
		"log2",
		"exp2",
		"floor",
		"ceil",
		"round",
		"trunc",
		"fract",
		"sign",
		"isnan",
		"isinf",
		"heaviside"
	];
	const MATH_BINARY = [
		"min",
		"max",
		"hypot",
		"mod",
		"snap",
		"step",
		"safediv",
		"swing"
	];
	const MATH_TERNARY = [
		"clamp",
		"lerp",
		"wrap",
		"pingpong",
		"fold",
		"smoothstep",
		"smootherstep",
		"select"
	];
	function getMathUnaryId(name) {
		const i$1 = MATH_UNARY.indexOf(name);
		return i$1 >= 0 ? i$1 : -1;
	}
	function getMathBinaryId(name) {
		const i$1 = MATH_BINARY.indexOf(name);
		return i$1 >= 0 ? i$1 : -1;
	}
	function getMathTernaryId(name) {
		const i$1 = MATH_TERNARY.indexOf(name);
		return i$1 >= 0 ? i$1 : -1;
	}
	const GEN_KEY_SEP = "\0";
	const primaryGenNameByVariantName = Object.create(null);
	const primarySpecByGenKey = Object.create(null);
	const opCodeByGenKey = Object.create(null);
	const paramHasByGenKey = Object.create(null);
	const defaultsByGenName = Object.create(null);
	const typePredOpByName = {
		isundefined: AudioVmOp.IsUndefined,
		isscalar: AudioVmOp.IsScalar,
		isaudio: AudioVmOp.IsAudio,
		isarray: AudioVmOp.IsArray,
		isfunction: AudioVmOp.IsFunction
	};
	for (const [genName, desc] of Object.entries(gens)) {
		const out = Object.create(null);
		for (const p$1 of desc.parameters) if (p$1.default !== void 0) out[p$1.name] = p$1.default;
		defaultsByGenName[genName] = out;
	}
	for (const s$1 of genSpecs) {
		if (!(s$1.variantName in primaryGenNameByVariantName)) primaryGenNameByVariantName[s$1.variantName] = s$1.genName;
		const key = `${s$1.genName}${GEN_KEY_SEP}${s$1.variantName}`;
		if (key in primarySpecByGenKey) continue;
		primarySpecByGenKey[key] = s$1;
		const has = Object.create(null);
		for (const pn of s$1.paramNames) has[pn] = true;
		paramHasByGenKey[key] = has;
		const opCode = AudioVmOp[`Gen${s$1.genName}_${s$1.variantName}`];
		if (opCode !== void 0) opCodeByGenKey[key] = opCode;
	}
	function callNameFromCallee(callee) {
		if (callee.type === "identifier") return callee.name;
		if (callee.type === "member") return callee.property;
		if (callee.type === "index") return "[]";
		return "?";
	}
	function bestEffortArgs(args) {
		const out = {};
		let pos = 0;
		for (const a$1 of args) {
			if (a$1.type !== "arg" || !a$1.value) continue;
			const key = a$1.name ?? String(pos++);
			if (!out[key]) out[key] = [];
			out[key].push(a$1.value);
		}
		return out;
	}
	function matchFixedArgs(state, callExpr, funcName, args, paramNames) {
		const matched = new Array(paramNames.length).fill(null);
		let positionalIndex = 0;
		for (const arg of args) {
			if (arg.type !== "arg" || !arg.value) continue;
			if (arg.name) {
				const argName = arg.name;
				let matchedParamIndex = -1;
				for (let j$1 = 0; j$1 < paramNames.length; j$1++) if (paramNames[j$1].startsWith(argName)) {
					matchedParamIndex = j$1;
					break;
				}
				if (matchedParamIndex === -1) {
					error(state, `No parameter matches '${argName}' in ${funcName}()`, callExpr.loc);
					return null;
				}
				if (matched[matchedParamIndex] !== null) {
					error(state, `Parameter '${paramNames[matchedParamIndex]}' already provided in ${funcName}()`, callExpr.loc);
					return null;
				}
				matched[matchedParamIndex] = arg.value;
			} else if (arg.shorthand && arg.value.type === "identifier") {
				const shorthandName = arg.value.name;
				const matchedParamIndex = paramNames.indexOf(shorthandName);
				if (matchedParamIndex !== -1) {
					if (matched[matchedParamIndex] !== null) {
						error(state, `Parameter '${paramNames[matchedParamIndex]}' already provided in ${funcName}()`, callExpr.loc);
						return null;
					}
					matched[matchedParamIndex] = arg.value;
				} else {
					while (positionalIndex < paramNames.length && matched[positionalIndex] !== null) positionalIndex++;
					if (positionalIndex >= paramNames.length) {
						error(state, `Too many arguments for ${funcName}()`, callExpr.loc);
						return null;
					}
					matched[positionalIndex] = arg.value;
					positionalIndex++;
				}
			} else {
				while (positionalIndex < paramNames.length && matched[positionalIndex] !== null) positionalIndex++;
				if (positionalIndex >= paramNames.length) {
					error(state, `Too many arguments for ${funcName}()`, callExpr.loc);
					return null;
				}
				matched[positionalIndex] = arg.value;
				positionalIndex++;
			}
		}
		return matched;
	}
	function pushCallMeta(state, callExpr, name, args) {
		if (callExpr.loc.line <= state.preludeLines) return;
		state.functionCallsMeta.push({
			name,
			astNode: callExpr,
			args
		});
	}
	function pushArrayGetHistoryForArrayExpr(state, arrayExpr, loc) {
		const pc = state.ops.length;
		if (loc.line <= state.preludeLines) return;
		let line = loc.line - state.preludeLines;
		let column = loc.column;
		let arrayGetElementMapping;
		if (arrayExpr.type === "array") {
			line = arrayExpr.loc.line - state.preludeLines;
			column = arrayExpr.loc.column;
			arrayGetElementMapping = arrayExpr.items.map((item, index) => ({
				index,
				startCol: item.loc.column,
				endCol: item.loc.column + (item.loc.end - item.loc.start)
			}));
		} else if (arrayExpr.type === "identifier") {
			const literal = state.varToArrayLiteral.get(arrayExpr.name);
			if (literal) {
				line = literal.loc.line - state.preludeLines;
				column = literal.loc.column;
				arrayGetElementMapping = literal.items.map((item, index) => ({
					index,
					startCol: item.loc.column,
					endCol: item.loc.column + (item.loc.end - item.loc.start)
				}));
			}
		}
		const historyEntry = {
			line,
			column,
			genName: "ArrayGet",
			pc: state.inFunction ? 0 : pc,
			inFunction: state.inFunction,
			__fromMainProgram: !state.isDeferredPass,
			arrayGetElementMapping
		};
		state.historySourceMap.push(historyEntry);
		if (state.inFunction && state.currentFunctionId !== null) {
			const entryWithPending = historyEntry;
			entryWithPending.__functionId = state.currentFunctionId;
			entryWithPending.__relativePc = pc;
		} else historyEntry.pc = pc;
	}
	function pushCallSiteSourceMap(state, callExpr, funcName) {
		const pc = state.ops.length;
		const entry = {
			line: Math.max(1, callExpr.loc.line - state.preludeLines),
			column: callExpr.loc.column,
			genName: "_call",
			pc: state.inFunction ? 0 : pc,
			inFunction: state.inFunction,
			__fromMainProgram: !state.isDeferredPass,
			callSite: true,
			funcName
		};
		state.historySourceMap.push(entry);
		if (state.inFunction && state.currentFunctionId !== null) {
			const entryWithPending = entry;
			entryWithPending.__functionId = state.currentFunctionId;
			entryWithPending.__relativePc = pc;
		} else entry.pc = pc;
	}
	function compileGetCall(state, arrayExpr, indexExpr, loc, resultExpr) {
		const stackBefore = state.stack.length;
		compileExpr(state, arrayExpr);
		compileExpr(state, indexExpr);
		pushArrayGetHistoryForArrayExpr(state, arrayExpr, loc);
		state.ops.push(AudioVmOp.ArrayGet, 0);
		state.stack.length = stackBefore;
		state.stack.push({ expr: resultExpr });
	}
	function compileCall(state, expr) {
		if (expr.callee.type === "member") {
			const memberExpr = expr.callee;
			if (memberExpr.property === "map") {
				const syntheticCall = {
					type: "call",
					callee: {
						type: "identifier",
						name: "map",
						loc: expr.loc
					},
					args: [{
						type: "arg",
						value: memberExpr.object,
						loc: memberExpr.object.loc
					}, ...expr.args],
					loc: expr.loc
				};
				compileCallWithArgs(state, syntheticCall, syntheticCall.args, -1);
				return;
			}
			if (memberExpr.property === "avg") {
				const syntheticCall = {
					type: "call",
					callee: {
						type: "identifier",
						name: "avg",
						loc: expr.loc
					},
					args: [{
						type: "arg",
						value: memberExpr.object,
						loc: memberExpr.object.loc
					}],
					loc: expr.loc
				};
				compileCallWithArgs(state, syntheticCall, syntheticCall.args, -1);
				return;
			}
			if (memberExpr.property === "shuffle") {
				const syntheticCall = {
					type: "call",
					callee: {
						type: "identifier",
						name: "shuffle",
						loc: expr.loc
					},
					args: [{
						type: "arg",
						value: memberExpr.object,
						loc: memberExpr.object.loc
					}, ...expr.args],
					loc: expr.loc
				};
				compileCallWithArgs(state, syntheticCall, syntheticCall.args, -1);
				return;
			}
			if (memberExpr.property === "reverse") {
				const syntheticCall = {
					type: "call",
					callee: {
						type: "identifier",
						name: "reverse",
						loc: expr.loc
					},
					args: [{
						type: "arg",
						value: memberExpr.object,
						loc: memberExpr.object.loc
					}],
					loc: expr.loc
				};
				compileCallWithArgs(state, syntheticCall, syntheticCall.args, -1);
				return;
			}
			if (memberExpr.property === "walk") {
				const syntheticCall = {
					type: "call",
					callee: {
						type: "identifier",
						name: "Walk",
						loc: expr.loc
					},
					args: [{
						type: "arg",
						value: memberExpr.object,
						loc: memberExpr.object.loc
					}, ...expr.args],
					loc: expr.loc
				};
				compileCallWithArgs(state, syntheticCall, syntheticCall.args, -1);
				return;
			}
			if (memberExpr.property === "glide") {
				const syntheticCall = {
					type: "call",
					callee: {
						type: "identifier",
						name: "Glide",
						loc: expr.loc
					},
					args: [{
						type: "arg",
						value: memberExpr.object,
						loc: memberExpr.object.loc
					}, ...expr.args],
					loc: expr.loc
				};
				compileCallWithArgs(state, syntheticCall, syntheticCall.args, -1);
				return;
			}
			if (memberExpr.property === "step") {
				const syntheticCall = {
					type: "call",
					callee: {
						type: "identifier",
						name: "Step",
						loc: expr.loc
					},
					args: [{
						type: "arg",
						value: memberExpr.object,
						loc: memberExpr.object.loc
					}, ...expr.args],
					loc: expr.loc
				};
				compileCallWithArgs(state, syntheticCall, syntheticCall.args, -1);
				return;
			}
			if (memberExpr.property === "random") {
				const syntheticCall = {
					type: "call",
					callee: {
						type: "identifier",
						name: "Random",
						loc: expr.loc
					},
					args: [{
						type: "arg",
						value: memberExpr.object,
						loc: memberExpr.object.loc
					}, ...expr.args],
					loc: expr.loc
				};
				compileCallWithArgs(state, syntheticCall, syntheticCall.args, -1);
				return;
			}
			pushCallMeta(state, expr, memberExpr.property, bestEffortArgs(expr.args));
			compileExpr(state, memberExpr.object);
			if (state.stack.length === 0) {
				error(state, "Method call requires an object", expr.loc);
				return;
			}
			if (memberExpr.property === "push") {
				const args = expr.args.map((arg) => arg.type === "arg" ? arg.value : null).filter((a$1) => a$1 !== null);
				if (args.length === 0) {
					error(state, "push() requires at least one argument", expr.loc);
					return;
				}
				for (const arg of args) compileExpr(state, arg);
				state.ops.push(AudioVmOp.ArrayPush);
				state.ops.push(args.length);
				state.stack.length -= args.length;
				state.stack.push({ expr });
				return;
			} else error(state, `Unknown method: ${memberExpr.property}`, expr.loc);
			return;
		}
		compileCallWithArgs(state, expr, expr.args, -1);
	}
	function compileCallWithArgs(state, callExpr, args, dollarIndex) {
		const callee = callExpr.callee;
		if (callee.type === "index") {
			pushCallMeta(state, callExpr, "[]", bestEffortArgs(args));
			for (const arg of args) if (arg.type === "arg" && arg.value) compileExpr(state, arg.value);
			const idxCallee = callee;
			compileGetCall(state, idxCallee.object, idxCallee.index, idxCallee.loc, idxCallee);
			state.ops.push(AudioVmOp.CallFunction);
			state.ops.push(args.length);
			state.stack.push({ expr: callExpr });
			return;
		}
		if (callee.type !== "identifier") {
			pushCallMeta(state, callExpr, callNameFromCallee(callee), bestEffortArgs(args));
			error(state, "Only simple function calls are supported", callExpr.loc);
			return;
		}
		const funcName = callee.name;
		if (funcName === "dtof") {
			pushCallMeta(state, callExpr, "dtof", bestEffortArgs(args));
			const degreeArg = args[0]?.type === "arg" ? args[0].value : null;
			if (!degreeArg || degreeArg.type !== "number") {
				error(state, "dtof(degree) requires a literal number (scale degree 1-based)", callExpr.loc);
				return;
			}
			compileDtofCall(state, degreeArg.value, callExpr.loc);
			state.stack.push({ expr: callExpr });
			return;
		}
		if (funcName === "get") {
			if (args.length < 2) {
				pushCallMeta(state, callExpr, "get", bestEffortArgs(args));
				error(state, "get(array, index) requires two arguments", callExpr.loc);
				return;
			}
			const arrayArg = args[0]?.type === "arg" ? args[0].value : null;
			const indexArg = args[1]?.type === "arg" ? args[1].value : null;
			if (!arrayArg || !indexArg) {
				pushCallMeta(state, callExpr, "get", bestEffortArgs(args));
				error(state, "get(array, index) requires two arguments", callExpr.loc);
				return;
			}
			compileGetCall(state, arrayArg, indexArg, callExpr.loc, callExpr);
			pushCallMeta(state, callExpr, "get", {
				array: [arrayArg],
				index: [indexArg]
			});
			return;
		}
		if (funcName === "out" || funcName === "solo" || funcName === "outs" || funcName === "sout") {
			pushCallMeta(state, callExpr, funcName, bestEffortArgs(args));
			const isSolo = funcName !== "out";
			let argCount$1 = 0;
			for (let i$1 = 0; i$1 < args.length; i$1++) {
				const arg = args[i$1];
				if (arg.type === "arg" && arg.value) {
					compileExpr(state, arg.value);
					argCount$1++;
				}
			}
			if (argCount$1 === 0) {
				error(state, `${funcName} requires at least one argument`, callExpr.loc);
				return;
			}
			if (argCount$1 > 2) {
				error(state, `${funcName} accepts 1 or 2 arguments, got ${argCount$1}`, callExpr.loc);
				return;
			}
			const userLine = Math.max(1, callExpr.loc.line - state.preludeLines);
			const outSoloPc = state.ops.length;
			const outSoloHistoryEntry = {
				line: userLine,
				column: callExpr.loc.column,
				genName: isSolo ? "Solo" : "Out",
				pc: state.inFunction ? 0 : outSoloPc,
				inFunction: state.inFunction,
				__fromMainProgram: !state.isDeferredPass
			};
			state.historySourceMap.push(outSoloHistoryEntry);
			if (state.inFunction && state.currentFunctionId !== null) {
				outSoloHistoryEntry.__functionId = state.currentFunctionId;
				outSoloHistoryEntry.__relativePc = outSoloPc;
			} else outSoloHistoryEntry.pc = outSoloPc;
			state.ops.push(isSolo ? AudioVmOp.Solo : AudioVmOp.Out);
			state.ops.push(argCount$1);
			for (let i$1 = 0; i$1 < argCount$1; i$1++) state.stack.pop();
			return;
		}
		if (funcName === "oversample") {
			pushCallMeta(state, callExpr, funcName, bestEffortArgs(args));
			if (args.length !== 2) {
				error(state, "oversample() requires exactly 2 arguments: factor and callback", callExpr.loc);
				return;
			}
			const factorArg = args[0]?.type === "arg" ? args[0].value : null;
			const callbackArg = args[1]?.type === "arg" ? args[1].value : null;
			if (!factorArg || !callbackArg) {
				error(state, "oversample() requires factor and callback arguments", callExpr.loc);
				return;
			}
			compileExpr(state, factorArg);
			if (callbackArg.type === "fn") {
				const prev = state.captureGlobalsInClosures;
				state.captureGlobalsInClosures = true;
				compileExpr(state, callbackArg);
				state.captureGlobalsInClosures = prev;
			} else compileExpr(state, callbackArg);
			state.ops.push(AudioVmOp.Oversample);
			if (state.stack.length >= 2) {
				state.stack.pop();
				state.stack.pop();
			} else state.stack.length = Math.max(0, state.stack.length - 2);
			state.stack.push({ expr: callExpr });
			return;
		}
		if (funcName === "espeak") {
			pushCallMeta(state, callExpr, funcName, bestEffortArgs(args));
			if (args.length < 1) {
				error(state, "espeak() requires at least 1 argument: text", callExpr.loc);
				return;
			}
			const matchedArgs = matchFixedArgs(state, callExpr, "espeak", args, [
				"text",
				"variant",
				"speed",
				"pitch"
			]);
			if (!matchedArgs) return;
			const [textArg, variantArg, speedArg, pitchArg] = matchedArgs;
			if (!textArg || textArg.type !== "string") {
				error(state, "espeak() text must be a literal string", callExpr.loc);
				return;
			}
			if (variantArg && variantArg.type !== "string") {
				error(state, "espeak() variant must be a literal string", callExpr.loc);
				return;
			}
			if (speedArg && speedArg.type !== "number") {
				error(state, "espeak() speed must be a literal number", callExpr.loc);
				return;
			}
			if (pitchArg && pitchArg.type !== "number") {
				error(state, "espeak() pitch must be a literal number", callExpr.loc);
				return;
			}
			const text = textArg.value;
			const variant = variantArg?.value ?? "m1";
			const speedNorm = speedArg ? Number(speedArg.value) : .5;
			const pitchNorm = pitchArg ? Number(pitchArg.value) : .5;
			const handle = sampleManager.registerEspeak();
			state.sampleRegistrations.push({
				handle,
				type: "espeak",
				espeakText: text,
				espeakVariant: variant,
				espeakSpeed: speedNorm,
				espeakPitch: pitchNorm
			});
			state.ops.push(AudioVmOp.PushScalar);
			state.ops.push(handle);
			state.stack.push({ expr: callExpr });
			return;
		}
		if (funcName === "sam") {
			pushCallMeta(state, callExpr, funcName, bestEffortArgs(args));
			if (args.length < 1) {
				error(state, "sam() requires at least 1 argument: text", callExpr.loc);
				return;
			}
			const matchedArgs = matchFixedArgs(state, callExpr, "sam", args, [
				"text",
				"pitch",
				"speed",
				"mouth",
				"throat",
				"singmode",
				"phonetic"
			]);
			if (!matchedArgs) return;
			const [textArg, pitchArg, speedArg, mouthArg, throatArg, singmodeArg, phoneticArg] = matchedArgs;
			if (!textArg || textArg.type !== "string") {
				error(state, "sam() text must be a literal string", callExpr.loc);
				return;
			}
			if (pitchArg && pitchArg.type !== "number") {
				error(state, "sam() pitch must be a literal number", callExpr.loc);
				return;
			}
			if (speedArg && speedArg.type !== "number") {
				error(state, "sam() speed must be a literal number", callExpr.loc);
				return;
			}
			if (mouthArg && mouthArg.type !== "number") {
				error(state, "sam() mouth must be a literal number", callExpr.loc);
				return;
			}
			if (throatArg && throatArg.type !== "number") {
				error(state, "sam() throat must be a literal number", callExpr.loc);
				return;
			}
			if (singmodeArg && singmodeArg.type !== "number") {
				error(state, "sam() singmode must be a literal number 0 or 1", callExpr.loc);
				return;
			}
			if (phoneticArg && phoneticArg.type !== "number") {
				error(state, "sam() phonetic must be a literal number 0 or 1", callExpr.loc);
				return;
			}
			const DEFAULT_SPEED = 72;
			const DEFAULT_PITCH = 64;
			const DEFAULT_THROAT = 128;
			const DEFAULT_MOUTH = 128;
			const pitchNorm = pitchArg ? Number(pitchArg.value) : void 0;
			const speedNorm = speedArg ? Number(speedArg.value) : void 0;
			const mouthNorm = mouthArg ? Number(mouthArg.value) : void 0;
			const throatNorm = throatArg ? Number(throatArg.value) : void 0;
			const pitch = pitchNorm === void 0 ? DEFAULT_PITCH : Math.round((1 - pitchNorm) * 255);
			const speed = speedNorm === void 0 ? DEFAULT_SPEED : Math.round((1 - speedNorm) * 255);
			const mouth = mouthNorm === void 0 ? DEFAULT_MOUTH : Math.round((1 - mouthNorm) * 255);
			const throat = throatNorm === void 0 ? DEFAULT_THROAT : Math.round((1 - throatNorm) * 255);
			const singmode = singmodeArg ? Number(singmodeArg.value) !== 0 : false;
			const phonetic = phoneticArg ? Number(phoneticArg.value) !== 0 : false;
			try {
				const buf = new H({
					pitch,
					speed,
					mouth,
					throat,
					singmode,
					phonetic
				}).buf32(textArg.value, phonetic);
				if (!(buf instanceof Float32Array)) {
					error(state, "sam() synthesis failed", callExpr.loc);
					return;
				}
				const sourceSampleRate = 22050;
				const targetSampleRate = 48e3;
				const ratio = targetSampleRate / sourceSampleRate;
				const targetLength = Math.max(1, Math.round(buf.length * ratio));
				const resampled = new Float32Array(targetLength);
				for (let i$1 = 0; i$1 < targetLength; i$1++) {
					const t$1 = i$1 / ratio;
					const i0 = Math.floor(t$1);
					const i1 = Math.min(i0 + 1, buf.length - 1);
					const frac = t$1 - i0;
					const v0 = buf[i0] ?? 0;
					resampled[i$1] = v0 + ((buf[i1] ?? 0) - v0) * frac;
				}
				const sampleRate$1 = targetSampleRate;
				const handle = sampleManager.registerInlineSample([resampled], sampleRate$1);
				state.sampleRegistrations.push({
					handle,
					type: "inline",
					inlineChannels: [resampled],
					inlineSampleRate: sampleRate$1
				});
				state.ops.push(AudioVmOp.PushScalar);
				state.ops.push(handle);
				state.stack.push({ expr: callExpr });
				return;
			} catch (e$1) {
				error(state, `sam() synthesis error: ${e$1 instanceof Error ? e$1.message : String(e$1)}`, callExpr.loc);
				return;
			}
		}
		if (funcName === "freesound") {
			pushCallMeta(state, callExpr, funcName, bestEffortArgs(args));
			if (args.length !== 1) {
				error(state, "freesound() requires exactly 1 argument: id", callExpr.loc);
				return;
			}
			const idArg = args[0]?.type === "arg" ? args[0].value : null;
			if (!idArg || idArg.type !== "number") {
				error(state, "freesound() id must be a literal number", callExpr.loc);
				return;
			}
			const id = idArg.value;
			const handle = sampleManager.registerFreesound(id);
			state.sampleRegistrations.push({
				handle,
				type: "freesound",
				freesoundId: id
			});
			state.ops.push(AudioVmOp.PushScalar);
			state.ops.push(handle);
			state.stack.push({ expr: callExpr });
			return;
		}
		if (funcName === "record") {
			pushCallMeta(state, callExpr, funcName, bestEffortArgs(args));
			compileRecord(state, callExpr);
			return;
		}
		if (funcName === "tram") {
			pushCallMeta(state, callExpr, funcName, bestEffortArgs(args));
			compileTram(state, callExpr, args);
			return;
		}
		if (funcName === "mini") {
			pushCallMeta(state, callExpr, funcName, bestEffortArgs(args));
			compileMini(state, callExpr, args);
			return;
		}
		if (funcName === "label") {
			const a0 = args[0]?.type === "arg" ? args[0].value : null;
			const a1 = args[1]?.type === "arg" ? args[1].value : null;
			const a2 = args[2]?.type === "arg" ? args[2].value : null;
			if (a0?.type === "number" && a1?.type === "string") {
				const bar = Math.max(0, Math.floor(Number(a0.value)) - 1);
				let colorIndex = 1;
				if (a2?.type === "number") colorIndex = Math.max(0, Math.min(5, Math.floor(Number(a2.value))));
				state.labels.push({
					bar,
					text: a1.value,
					colorIndex
				});
			}
			state.ops.push(AudioVmOp.PushScalar);
			state.ops.push(0);
			state.stack.push({ expr: callExpr });
			return;
		}
		if (funcName === "timeline") {
			pushCallMeta(state, callExpr, funcName, bestEffortArgs(args));
			compileTimeline(state, callExpr, args);
			return;
		}
		if (funcName === "alloc") {
			pushCallMeta(state, callExpr, funcName, bestEffortArgs(args));
			if (args.length !== 1) {
				error(state, "alloc() requires 1 argument: seconds", callExpr.loc);
				return;
			}
			const secondsArg = args[0]?.type === "arg" ? args[0].value : null;
			if (!secondsArg) {
				error(state, "alloc() requires seconds argument", callExpr.loc);
				return;
			}
			const stackBefore$1 = state.stack.length;
			compileExpr(state, secondsArg);
			state.ops.push(AudioVmOp.Alloc);
			state.ops.push(state.nextAllocCallSiteId++);
			state.stack.length = stackBefore$1;
			state.stack.push({ expr: callExpr });
			return;
		}
		if (funcName === "write") {
			pushCallMeta(state, callExpr, funcName, bestEffortArgs(args));
			if (args.length !== 2) {
				error(state, "write() requires 2 arguments: input and buf", callExpr.loc);
				return;
			}
			const inputArg = args[0]?.type === "arg" ? args[0].value : null;
			const bufArg = args[1]?.type === "arg" ? args[1].value : null;
			if (!inputArg || !bufArg) {
				error(state, "write() requires input and buf arguments", callExpr.loc);
				return;
			}
			const stackBefore$1 = state.stack.length;
			compileExpr(state, inputArg);
			compileExpr(state, bufArg);
			state.ops.push(AudioVmOp.Write);
			state.stack.length = stackBefore$1;
			state.stack.push({ expr: callExpr });
			return;
		}
		if (funcName === "read") {
			pushCallMeta(state, callExpr, funcName, bestEffortArgs(args));
			if (args.length !== 2) {
				error(state, "read() requires 2 arguments: buf and offset (seconds)", callExpr.loc);
				return;
			}
			const bufArg = args[0]?.type === "arg" ? args[0].value : null;
			const offsetArg = args[1]?.type === "arg" ? args[1].value : null;
			if (!bufArg || !offsetArg) {
				error(state, "read() requires buf and offset arguments", callExpr.loc);
				return;
			}
			const stackBefore$1 = state.stack.length;
			compileExpr(state, bufArg);
			compileExpr(state, offsetArg);
			state.ops.push(AudioVmOp.Read);
			state.stack.length = stackBefore$1;
			state.stack.push({ expr: callExpr });
			return;
		}
		if (funcName === "isundefined" || funcName === "isscalar" || funcName === "isaudio" || funcName === "isarray" || funcName === "isfunction") {
			pushCallMeta(state, callExpr, funcName, bestEffortArgs(args));
			let argCount$1 = dollarIndex >= 0 ? 1 : 0;
			for (const a$1 of args) if (a$1.type === "arg" && a$1.value) argCount$1++;
			if (argCount$1 > 1) {
				error(state, `Too many arguments for function '${funcName}'`, callExpr.loc);
				return;
			}
			const argExpr = dollarIndex === 0 ? null : args[0]?.type === "arg" ? args[0].value : null;
			if (argExpr) compileExpr(state, argExpr);
			if (state.stack.length === 0) {
				error(state, `${funcName} requires a value`, callExpr.loc);
				return;
			}
			const op = typePredOpByName[funcName];
			state.ops.push(op);
			state.stack.pop();
			state.stack.push({ expr: callExpr });
			return;
		}
		const mathUnaryId = getMathUnaryId(funcName);
		if (mathUnaryId >= 0) {
			pushCallMeta(state, callExpr, funcName, bestEffortArgs(args));
			let argCount$1 = 0;
			for (const a$1 of args) if (a$1.type === "arg" && a$1.value) argCount$1++;
			if (argCount$1 > 1) {
				error(state, `Too many arguments for function '${funcName}'`, callExpr.loc);
				return;
			}
			const argExpr = args[0]?.type === "arg" ? args[0].value : null;
			if (!argExpr) {
				error(state, `${funcName}(x) requires one argument`, callExpr.loc);
				return;
			}
			compileExpr(state, argExpr);
			if (state.stack.length === 0) {
				error(state, `${funcName} requires a value`, callExpr.loc);
				return;
			}
			state.ops.push(AudioVmOp.MathUnary);
			state.ops.push(mathUnaryId);
			state.stack.pop();
			state.stack.push({ expr: callExpr });
			return;
		}
		const mathBinaryId = getMathBinaryId(funcName);
		if (mathBinaryId >= 0) {
			pushCallMeta(state, callExpr, funcName, bestEffortArgs(args));
			let argCount$1 = 0;
			for (const a$1 of args) if (a$1.type === "arg" && a$1.value) argCount$1++;
			if (argCount$1 > 2) {
				error(state, `Too many arguments for function '${funcName}'`, callExpr.loc);
				return;
			}
			const left = args[0]?.type === "arg" ? args[0].value : null;
			const right = args[1]?.type === "arg" ? args[1].value : null;
			if (!left || !right) {
				error(state, `${funcName}(x, y) requires two arguments`, callExpr.loc);
				return;
			}
			compileExpr(state, left);
			compileExpr(state, right);
			if (state.stack.length < 2) {
				error(state, `${funcName} requires two values`, callExpr.loc);
				return;
			}
			state.ops.push(AudioVmOp.MathBinary);
			state.ops.push(mathBinaryId);
			state.stack.pop();
			state.stack.pop();
			state.stack.push({ expr: callExpr });
			return;
		}
		const mathTernaryId = getMathTernaryId(funcName);
		if (mathTernaryId >= 0) {
			pushCallMeta(state, callExpr, funcName, bestEffortArgs(args));
			let argCount$1 = 0;
			for (const a$2 of args) if (a$2.type === "arg" && a$2.value) argCount$1++;
			if (argCount$1 > 3) {
				error(state, `Too many arguments for function '${funcName}'`, callExpr.loc);
				return;
			}
			const a$1 = args[0]?.type === "arg" ? args[0].value : null;
			const b$1 = args[1]?.type === "arg" ? args[1].value : null;
			const c$1 = args[2]?.type === "arg" ? args[2].value : null;
			if (!a$1 || !b$1 || !c$1) {
				error(state, `${funcName}(a, b, c) requires three arguments`, callExpr.loc);
				return;
			}
			compileExpr(state, a$1);
			compileExpr(state, b$1);
			compileExpr(state, c$1);
			if (state.stack.length < 3) {
				error(state, `${funcName} requires three values`, callExpr.loc);
				return;
			}
			state.ops.push(AudioVmOp.MathTernary);
			state.ops.push(mathTernaryId);
			state.stack.pop();
			state.stack.pop();
			state.stack.pop();
			state.stack.push({ expr: callExpr });
			return;
		}
		if (funcName === "slicer") {
			const thresholdArg = args.find((a$1) => a$1.type === "arg" && a$1.name === "threshold" && a$1.value);
			if (thresholdArg && thresholdArg.type === "arg" && thresholdArg.value?.type !== "number") {
				error(state, "slicer() threshold parameter must be a scalar value", callExpr.loc);
				return;
			}
		}
		if (funcName === "Walk") {
			pushCallMeta(state, callExpr, "Walk", bestEffortArgs(args));
			if (args.length < 2) {
				error(state, "Walk(array, bar, swing?, offset?) requires at least array and bar", callExpr.loc);
				return;
			}
			const arrayArg = args[0]?.type === "arg" ? args[0].value : null;
			const barArg = args[1]?.type === "arg" ? args[1].value : null;
			const swingArg = args.length > 2 && args[2]?.type === "arg" ? args[2].value : null;
			const offsetArg = args.length > 3 && args[3]?.type === "arg" ? args[3].value : null;
			if (!arrayArg || !barArg) {
				error(state, "Walk requires array and bar arguments", callExpr.loc);
				return;
			}
			compileExpr(state, arrayArg);
			compileExpr(state, barArg);
			if (swingArg) compileExpr(state, swingArg);
			else {
				state.ops.push(AudioVmOp.PushScalar);
				state.ops.push(0);
				state.stack.push({ expr: callExpr });
			}
			if (offsetArg) compileExpr(state, offsetArg);
			else {
				state.ops.push(AudioVmOp.PushScalar);
				state.ops.push(0);
				state.stack.push({ expr: callExpr });
			}
			pushArrayGetHistoryForArrayExpr(state, arrayArg, arrayArg.loc);
			state.ops.push(AudioVmOp.Walk);
			state.stack.length -= 4;
			state.stack.push({ expr: callExpr });
			return;
		}
		if (funcName === "Glide") {
			pushCallMeta(state, callExpr, "Glide", bestEffortArgs(args));
			if (args.length < 2) {
				error(state, "Glide(array, bar, exponent?) requires at least array and bar", callExpr.loc);
				return;
			}
			const arrayArg = args[0]?.type === "arg" ? args[0].value : null;
			const barArg = args[1]?.type === "arg" ? args[1].value : null;
			const exponentArg = args.length > 2 && args[2]?.type === "arg" ? args[2].value : null;
			if (!arrayArg || !barArg) {
				error(state, "Glide requires array and bar arguments", callExpr.loc);
				return;
			}
			compileExpr(state, arrayArg);
			compileExpr(state, barArg);
			if (exponentArg) compileExpr(state, exponentArg);
			else {
				state.ops.push(AudioVmOp.PushScalar);
				state.ops.push(1);
				state.stack.push({ expr: callExpr });
			}
			state.ops.push(AudioVmOp.Glide);
			state.stack.length -= 3;
			state.stack.push({ expr: callExpr });
			return;
		}
		if (funcName === "Step") {
			pushCallMeta(state, callExpr, "Step", bestEffortArgs(args));
			if (args.length < 2) {
				error(state, "Step(array, trig) requires array and trigger", callExpr.loc);
				return;
			}
			const arrayArg = args[0]?.type === "arg" ? args[0].value : null;
			const trigArg = args[1]?.type === "arg" ? args[1].value : null;
			if (!arrayArg || !trigArg) {
				error(state, "Step requires array and trig arguments", callExpr.loc);
				return;
			}
			compileExpr(state, arrayArg);
			compileExpr(state, trigArg);
			pushArrayGetHistoryForArrayExpr(state, arrayArg, arrayArg.loc);
			state.ops.push(AudioVmOp.Step);
			state.ops.push(state.nextStepCallSiteId++);
			state.stack.length -= 2;
			state.stack.push({ expr: callExpr });
			return;
		}
		if (funcName === "Random") {
			pushCallMeta(state, callExpr, "Random", bestEffortArgs(args));
			if (args.length < 2) {
				error(state, "Random(array, trig, seed?) requires array and trigger", callExpr.loc);
				return;
			}
			const arrayArg = args[0]?.type === "arg" ? args[0].value : null;
			const trigArg = args[1]?.type === "arg" ? args[1].value : null;
			const seedArg = args[2]?.type === "arg" ? args[2].value : null;
			if (!arrayArg || !trigArg) {
				error(state, "Random requires array and trig arguments", callExpr.loc);
				return;
			}
			compileExpr(state, arrayArg);
			compileExpr(state, trigArg);
			if (seedArg) compileExpr(state, seedArg);
			else {
				state.ops.push(AudioVmOp.PushScalar);
				state.ops.push(0);
				state.stack.push({ expr: callExpr });
			}
			pushArrayGetHistoryForArrayExpr(state, arrayArg, arrayArg.loc);
			state.ops.push(AudioVmOp.Random);
			state.ops.push(state.nextStepCallSiteId++);
			state.stack.length -= 3;
			state.stack.push({ expr: callExpr });
			return;
		}
		const variantGenName = primaryGenNameByVariantName[funcName];
		const genName = variantGenName ?? funcName.charAt(0).toUpperCase() + funcName.slice(1);
		const genKey = `${genName}${GEN_KEY_SEP}${variantGenName ? funcName : "default"}`;
		const spec = primarySpecByGenKey[genKey];
		if (!spec) {
			const varInfo = lookupVariable(state, funcName);
			if (varInfo) {
				compileUserFunctionCall(state, callExpr, funcName, varInfo, args, dollarIndex);
				return;
			}
			pushCallMeta(state, callExpr, funcName, bestEffortArgs(args));
			error(state, `Unknown generator: ${funcName}`, callExpr.loc);
			return;
		}
		const paramCount = spec.paramNames.length;
		const usesInput = spec.usesInput;
		const totalArgs = paramCount + (usesInput ? 1 : 0);
		const stackBefore = state.stack.length;
		const paramHas = paramHasByGenKey[genKey];
		const namedByName = Object.create(null);
		const namedOrder = [];
		const positionalArgs = [];
		let argCount = 0;
		for (const a$1 of args) {
			if (a$1.type !== "arg" || !a$1.value) continue;
			argCount++;
			if (a$1.name) {
				if (!(a$1.name in namedByName)) namedOrder.push(a$1.name);
				namedByName[a$1.name] = a$1.value;
				continue;
			}
			if (a$1.value.type === "identifier") {
				const n$1 = a$1.value.name;
				if (paramHas[n$1]) {
					if (!(n$1 in namedByName)) namedOrder.push(n$1);
					namedByName[n$1] = a$1.value;
					continue;
				}
			}
			positionalArgs.push(a$1.value);
		}
		argCount += dollarIndex >= 0 ? 1 : 0;
		if (argCount > totalArgs) {
			error(state, `Too many arguments for function '${funcName}'`, callExpr.loc);
			return;
		}
		const opCode = opCodeByGenKey[genKey];
		if (opCode === void 0) {
			error(state, `Unknown opcode for generator: ${spec.genName}_${spec.variantName}`, callExpr.loc);
			return;
		}
		let positionalIndex = 0;
		const resolvedArgs = callExpr.loc.line <= state.preludeLines ? null : {};
		const namedUsed = new Array(namedOrder.length).fill(false);
		const defaults = defaultsByGenName[genName];
		for (let i$1 = 0; i$1 < totalArgs; i$1++) if (i$1 === dollarIndex) {
			if (state.stack.length === 0) {
				error(state, "$ used without a value on the stack", callExpr.loc);
				return;
			}
			positionalIndex++;
		} else {
			const paramIndex = usesInput ? i$1 - 1 : i$1;
			const paramName = paramIndex >= 0 ? spec.paramNames[paramIndex] : null;
			let argExpr = null;
			if (paramName) for (let j$1 = 0; j$1 < namedOrder.length; j$1++) {
				if (namedUsed[j$1]) continue;
				const argName = namedOrder[j$1];
				if (!paramName.startsWith(argName)) continue;
				namedUsed[j$1] = true;
				argExpr = namedByName[argName] ?? null;
				break;
			}
			if (!argExpr) {
				argExpr = positionalArgs[positionalIndex] ?? null;
				positionalIndex++;
			}
			if (resolvedArgs && paramName && argExpr) (resolvedArgs[paramName] ??= []).push(argExpr);
			if (argExpr) compileExpr(state, argExpr);
			else {
				const defaultValue = (paramName ? defaults?.[paramName] : void 0) ?? 0;
				state.ops.push(AudioVmOp.PushScalar);
				state.ops.push(defaultValue);
				state.stack.push({ expr: {
					type: "number",
					value: defaultValue,
					loc: callExpr.loc
				} });
			}
		}
		const pc = state.ops.length;
		if (callExpr.loc.line > state.preludeLines) {
			const historyEntry = {
				line: callExpr.loc.line - state.preludeLines,
				column: callExpr.loc.column,
				genName: spec.genName,
				pc: state.inFunction ? 0 : pc,
				inFunction: state.inFunction,
				__fromMainProgram: !state.isDeferredPass
			};
			state.historySourceMap.push(historyEntry);
			if (state.inFunction && state.currentFunctionId !== null) {
				historyEntry.__functionId = state.currentFunctionId;
				historyEntry.__relativePc = pc;
			} else historyEntry.pc = pc;
		}
		state.ops.push(opCode);
		state.stack.length = stackBefore;
		state.stack.push({ expr: callExpr });
		pushCallMeta(state, callExpr, spec.genName, resolvedArgs ?? {});
	}
	function resolveFunctionInfo(state, funcName) {
		let info = getFunctionByName(state, funcName);
		if (info) return info;
		let target = funcName;
		while (state.functionAliases.has(target)) {
			target = state.functionAliases.get(target);
			info = getFunctionByName(state, target);
			if (info) return info;
		}
	}
	function compileUserFunctionCall(state, callExpr, funcName, varInfo, args, dollarIndex) {
		const funcInfo = getFunctionByName(state, funcName);
		const resolvedFuncInfo = funcInfo ?? resolveFunctionInfo(state, funcName);
		const callSiteLocKey = `${callExpr.loc.line}:${callExpr.loc.column}:${callExpr.loc.start}:${callExpr.loc.end}`;
		const callSiteId = state.recordCallIds.get(callSiteLocKey);
		if (!state.compilingRecordCallback && funcInfo && state.functionToRecordCall.has(funcName) && callSiteId !== void 0) processRecordCallSite(state, callExpr, funcName, funcInfo, callSiteId);
		const hasNamedArgs = args.some((arg) => arg.type === "arg" && (arg.name || arg.shorthand && arg.value.type === "identifier"));
		if (!resolvedFuncInfo || !hasNamedArgs) {
			pushCallMeta(state, callExpr, funcName, bestEffortArgs(args));
			const argsProvided = args.filter((a$1) => a$1.type === "arg" && a$1.value).length + (dollarIndex >= 0 ? 1 : 0);
			const paramCount$1 = resolvedFuncInfo?.params.length ?? 0;
			if (resolvedFuncInfo && argsProvided > paramCount$1) {
				error(state, `Too many arguments for function '${funcName}'`, callExpr.loc);
				return;
			}
			for (let i$1 = 0; i$1 < args.length; i$1++) {
				if (i$1 === dollarIndex) continue;
				const arg = args[i$1];
				if (arg.type === "arg" && arg.value) compileExpr(state, arg.value);
			}
			const missingCount = Math.max(0, paramCount$1 - argsProvided);
			for (let i$1 = 0; i$1 < missingCount; i$1++) {
				state.ops.push(AudioVmOp.PushUndefined);
				state.stack.push({ expr: callExpr });
			}
			const argCount$1 = argsProvided + missingCount;
			compileGetVariable(state, varInfo);
			pushCallSiteSourceMap(state, callExpr, funcName);
			state.ops.push(AudioVmOp.CallFunction);
			state.ops.push(argCount$1);
			state.stack.push({ expr: callExpr });
			return;
		}
		const params = resolvedFuncInfo.params;
		const paramCount = params.length;
		const matchedArgs = new Array(paramCount).fill(null);
		let positionalIndex = 0;
		let dollarParamIndex = -1;
		for (let i$1 = 0; i$1 < args.length; i$1++) {
			const arg = args[i$1];
			if (arg.type !== "arg") continue;
			if (arg.name) {
				const argName = arg.name;
				let matchedParamIndex = -1;
				for (let j$1 = 0; j$1 < params.length; j$1++) if (params[j$1].startsWith(argName)) {
					matchedParamIndex = j$1;
					break;
				}
				if (matchedParamIndex === -1) {
					error(state, `No parameter matches '${argName}' in function '${funcName}'`, callExpr.loc);
					return;
				}
				if (matchedArgs[matchedParamIndex] !== null) {
					error(state, `Parameter '${params[matchedParamIndex]}' already provided`, callExpr.loc);
					return;
				}
				matchedArgs[matchedParamIndex] = arg.value;
			} else if (arg.shorthand && arg.value.type === "identifier") {
				const shorthandName = arg.value.name;
				const matchedParamIndex = params.indexOf(shorthandName);
				if (matchedParamIndex !== -1) {
					if (matchedArgs[matchedParamIndex] !== null) {
						error(state, `Parameter '${params[matchedParamIndex]}' already provided`, callExpr.loc);
						return;
					}
					matchedArgs[matchedParamIndex] = arg.value;
					if (i$1 === dollarIndex) dollarParamIndex = matchedParamIndex;
				} else {
					while (positionalIndex < paramCount && matchedArgs[positionalIndex] !== null) positionalIndex++;
					if (positionalIndex >= paramCount) {
						error(state, `Too many arguments for function '${funcName}'`, callExpr.loc);
						return;
					}
					matchedArgs[positionalIndex] = arg.value;
					if (i$1 === dollarIndex) dollarParamIndex = positionalIndex;
					positionalIndex++;
				}
			} else {
				while (positionalIndex < paramCount && matchedArgs[positionalIndex] !== null) positionalIndex++;
				if (positionalIndex >= paramCount) {
					error(state, `Too many arguments for function '${funcName}'`, callExpr.loc);
					return;
				}
				matchedArgs[positionalIndex] = arg.value;
				if (i$1 === dollarIndex) dollarParamIndex = positionalIndex;
				positionalIndex++;
			}
		}
		const resolvedArgs = {};
		for (let i$1 = 0; i$1 < paramCount; i$1++) {
			const expr = matchedArgs[i$1];
			if (expr) resolvedArgs[params[i$1]] = [expr];
		}
		pushCallMeta(state, callExpr, funcName, resolvedArgs);
		let lastProvidedIndex = -1;
		for (let i$1 = paramCount - 1; i$1 >= 0; i$1--) if (matchedArgs[i$1] !== null) {
			lastProvidedIndex = i$1;
			break;
		}
		const argCount = lastProvidedIndex >= 0 ? lastProvidedIndex + 1 : paramCount;
		for (let i$1 = 0; i$1 < argCount; i$1++) {
			if (i$1 === dollarParamIndex) continue;
			const argExpr = matchedArgs[i$1];
			if (argExpr) compileExpr(state, argExpr);
			else {
				state.ops.push(AudioVmOp.PushUndefined);
				state.stack.push({ expr: callExpr });
			}
		}
		compileGetVariable(state, varInfo);
		pushCallSiteSourceMap(state, callExpr, funcName);
		state.ops.push(AudioVmOp.CallFunction);
		state.ops.push(argCount);
		state.stack.push({ expr: callExpr });
	}
	function compileIf(state, stmt) {
		compileExpr(state, stmt.test);
		state.ops.push(AudioVmOp.JumpIfFalse);
		const jumpToElsePatchIndex = state.ops.length;
		state.ops.push(0);
		compileStmt(state, stmt.then);
		if (stmt.else) {
			state.ops.push(AudioVmOp.Jump);
			const jumpToEndPatchIndex = state.ops.length;
			state.ops.push(0);
			const elseTarget = state.ops.length;
			state.ops[jumpToElsePatchIndex] = elseTarget;
			compileStmt(state, stmt.else);
			const endTarget = state.ops.length;
			state.ops[jumpToEndPatchIndex] = endTarget;
		} else {
			const endTarget = state.ops.length;
			state.ops[jumpToElsePatchIndex] = endTarget;
		}
	}
	function compileWhile(state, stmt) {
		const loopStart = state.ops.length;
		const loopContext = {
			breakTargets: [],
			continueTargets: []
		};
		state.loopStack.push(loopContext);
		compileExpr(state, stmt.test);
		state.ops.push(AudioVmOp.JumpIfFalse);
		const jumpToEndPatchIndex = state.ops.length;
		state.ops.push(0);
		compileStmt(state, stmt.body);
		const continueTarget = state.ops.length;
		for (const patchIndex of loopContext.continueTargets) state.ops[patchIndex] = continueTarget;
		state.ops.push(AudioVmOp.Jump);
		state.ops.push(loopStart);
		const endTarget = state.ops.length;
		state.ops[jumpToEndPatchIndex] = endTarget;
		for (const patchIndex of loopContext.breakTargets) state.ops[patchIndex] = endTarget;
		state.loopStack.pop();
	}
	function compileDoWhile(state, stmt) {
		const loopStart = state.ops.length;
		const loopContext = {
			breakTargets: [],
			continueTargets: []
		};
		state.loopStack.push(loopContext);
		compileStmt(state, stmt.body);
		const continueTarget = state.ops.length;
		for (const patchIndex of loopContext.continueTargets) state.ops[patchIndex] = continueTarget;
		compileExpr(state, stmt.test);
		state.ops.push(AudioVmOp.JumpIfTrue);
		state.ops.push(loopStart);
		const endTarget = state.ops.length;
		for (const patchIndex of loopContext.breakTargets) state.ops[patchIndex] = endTarget;
		state.loopStack.pop();
	}
	function compileFor(state, stmt) {
		pushScope(state);
		compileExpr(state, stmt.from);
		if (state.stack.length === 0) {
			error(state, "for loop start has no value", stmt.loc);
			popScope(state);
			return;
		}
		const loopVar = declareVariable(state, stmt.init, stmt.loc);
		compileSetVariable(state, loopVar, stmt.from);
		state.stack.pop();
		const loopStart = state.ops.length;
		const loopContext = {
			breakTargets: [],
			continueTargets: []
		};
		state.loopStack.push(loopContext);
		compileGetVariable(state, loopVar);
		state.stack.push({ expr: {
			type: "identifier",
			name: stmt.init,
			loc: stmt.loc
		} });
		compileExpr(state, stmt.to);
		state.ops.push(AudioVmOp.LessEqual);
		state.stack.pop();
		state.stack.pop();
		state.stack.push({ expr: stmt.from });
		state.ops.push(AudioVmOp.JumpIfFalse);
		const jumpToEndPatchIndex = state.ops.length;
		state.ops.push(0);
		state.stack.pop();
		compileStmt(state, stmt.body);
		const continueTarget = state.ops.length;
		for (const patchIndex of loopContext.continueTargets) state.ops[patchIndex] = continueTarget;
		compileGetVariable(state, loopVar);
		state.stack.push({ expr: {
			type: "identifier",
			name: stmt.init,
			loc: stmt.loc
		} });
		state.ops.push(AudioVmOp.PushScalar);
		state.ops.push(1);
		state.stack.push({ expr: {
			type: "number",
			value: 1,
			loc: stmt.loc
		} });
		state.ops.push(AudioVmOp.Add);
		state.stack.pop();
		state.stack.pop();
		state.stack.push({ expr: {
			type: "identifier",
			name: stmt.init,
			loc: stmt.loc
		} });
		compileSetVariable(state, loopVar, stmt.from);
		state.stack.pop();
		state.ops.push(AudioVmOp.Jump);
		state.ops.push(loopStart);
		const endTarget = state.ops.length;
		state.ops[jumpToEndPatchIndex] = endTarget;
		for (const patchIndex of loopContext.breakTargets) state.ops[patchIndex] = endTarget;
		state.loopStack.pop();
		popScope(state);
	}
	function compileForOf(state, stmt) {
		const tempId = state.nextTempId++;
		const arrName = `__arr_${tempId}`;
		const lenName = `__len_${tempId}`;
		const idxName = `__i_${tempId}`;
		compileExpr(state, stmt.iterable);
		if (state.stack.length === 0) {
			error(state, "for-of iterable has no value", stmt.loc);
			return;
		}
		const arrayVar = declareVariable(state, arrName, stmt.loc);
		compileSetVariable(state, arrayVar, stmt.iterable);
		state.stack.pop();
		compileGetVariable(state, arrayVar);
		state.stack.push({ expr: stmt.iterable });
		state.ops.push(AudioVmOp.ArrayLen);
		state.stack.pop();
		state.stack.push({ expr: stmt.iterable });
		const lengthVar = declareVariable(state, lenName, stmt.loc);
		compileSetVariable(state, lengthVar, stmt.iterable);
		state.stack.pop();
		state.ops.push(AudioVmOp.PushScalar);
		state.ops.push(0);
		state.stack.push({ expr: {
			type: "number",
			value: 0,
			loc: stmt.loc
		} });
		const indexVar = declareVariable(state, idxName, stmt.loc);
		compileSetVariable(state, indexVar, stmt.iterable);
		state.stack.pop();
		const loopStart = state.ops.length;
		const loopContext = {
			breakTargets: [],
			continueTargets: []
		};
		state.loopStack.push(loopContext);
		compileGetVariable(state, indexVar);
		state.stack.push({ expr: {
			type: "identifier",
			name: idxName,
			loc: stmt.loc
		} });
		compileGetVariable(state, lengthVar);
		state.stack.push({ expr: {
			type: "identifier",
			name: lenName,
			loc: stmt.loc
		} });
		state.ops.push(AudioVmOp.Less);
		state.stack.pop();
		state.stack.pop();
		state.stack.push({ expr: stmt.iterable });
		state.ops.push(AudioVmOp.JumpIfFalse);
		const jumpToEndPatchIndex = state.ops.length;
		state.ops.push(0);
		state.stack.pop();
		compileGetVariable(state, arrayVar);
		state.stack.push({ expr: stmt.iterable });
		compileGetVariable(state, indexVar);
		state.stack.push({ expr: {
			type: "identifier",
			name: idxName,
			loc: stmt.loc
		} });
		state.ops.push(AudioVmOp.ArrayGet, 0);
		state.stack.pop();
		state.stack.pop();
		state.stack.push({ expr: {
			type: "identifier",
			name: stmt.value,
			loc: stmt.loc
		} });
		compileSetVariable(state, declareVariable(state, stmt.value, stmt.loc), stmt.iterable);
		state.stack.pop();
		if (stmt.index) {
			compileGetVariable(state, indexVar);
			state.stack.push({ expr: {
				type: "identifier",
				name: idxName,
				loc: stmt.loc
			} });
			compileSetVariable(state, declareVariable(state, stmt.index, stmt.loc), stmt.iterable);
			state.stack.pop();
		}
		if (stmt.length) {
			compileGetVariable(state, lengthVar);
			state.stack.push({ expr: {
				type: "identifier",
				name: lenName,
				loc: stmt.loc
			} });
			compileSetVariable(state, declareVariable(state, stmt.length, stmt.loc), stmt.iterable);
			state.stack.pop();
		}
		compileStmt(state, stmt.body);
		const continueTarget = state.ops.length;
		for (const patchIndex of loopContext.continueTargets) state.ops[patchIndex] = continueTarget;
		compileGetVariable(state, indexVar);
		state.stack.push({ expr: {
			type: "identifier",
			name: idxName,
			loc: stmt.loc
		} });
		state.ops.push(AudioVmOp.PushScalar);
		state.ops.push(1);
		state.stack.push({ expr: {
			type: "number",
			value: 1,
			loc: stmt.loc
		} });
		state.ops.push(AudioVmOp.Add);
		state.stack.pop();
		state.stack.pop();
		state.stack.push({ expr: {
			type: "identifier",
			name: idxName,
			loc: stmt.loc
		} });
		compileSetVariable(state, indexVar, stmt.iterable);
		state.stack.pop();
		state.ops.push(AudioVmOp.Jump);
		state.ops.push(loopStart);
		const endTarget = state.ops.length;
		state.ops[jumpToEndPatchIndex] = endTarget;
		for (const patchIndex of loopContext.breakTargets) state.ops[patchIndex] = endTarget;
		state.loopStack.pop();
	}
	function compileBreak(state, stmt) {
		if (state.loopStack.length === 0) {
			error(state, "break statement outside of loop", stmt.loc);
			return;
		}
		let targetLoop = null;
		if (stmt.label) {
			for (let i$1 = state.loopStack.length - 1; i$1 >= 0; i$1--) if (state.loopStack[i$1].label === stmt.label) {
				targetLoop = state.loopStack[i$1];
				break;
			}
			if (!targetLoop) {
				error(state, `Label not found: ${stmt.label}`, stmt.loc);
				return;
			}
		} else targetLoop = state.loopStack[state.loopStack.length - 1];
		state.ops.push(AudioVmOp.Jump);
		const patchIndex = state.ops.length;
		state.ops.push(0);
		targetLoop.breakTargets.push(patchIndex);
	}
	function compileContinue(state, stmt) {
		if (state.loopStack.length === 0) {
			error(state, "continue statement outside of loop", stmt.loc);
			return;
		}
		let targetLoop = null;
		if (stmt.label) {
			for (let i$1 = state.loopStack.length - 1; i$1 >= 0; i$1--) if (state.loopStack[i$1].label === stmt.label) {
				targetLoop = state.loopStack[i$1];
				break;
			}
			if (!targetLoop) {
				error(state, `Label not found: ${stmt.label}`, stmt.loc);
				return;
			}
		} else targetLoop = state.loopStack[state.loopStack.length - 1];
		state.ops.push(AudioVmOp.Jump);
		const patchIndex = state.ops.length;
		state.ops.push(0);
		targetLoop.continueTargets.push(patchIndex);
	}
	function compileLabel(state, stmt) {
		if (stmt.stmt.type === "while" || stmt.stmt.type === "do" || stmt.stmt.type === "for" || stmt.stmt.type === "for-of") {
			const loopContext = {
				label: stmt.name,
				breakTargets: [],
				continueTargets: []
			};
			state.loopStack.push(loopContext);
			if (stmt.stmt.type === "while") {
				const loopStart = state.ops.length;
				compileExpr(state, stmt.stmt.test);
				state.ops.push(AudioVmOp.JumpIfFalse);
				const jumpToEndPatchIndex = state.ops.length;
				state.ops.push(0);
				compileStmt(state, stmt.stmt.body);
				const continueTarget = state.ops.length;
				for (const patchIndex of loopContext.continueTargets) state.ops[patchIndex] = continueTarget;
				state.ops.push(AudioVmOp.Jump);
				state.ops.push(loopStart);
				const endTarget = state.ops.length;
				state.ops[jumpToEndPatchIndex] = endTarget;
				for (const patchIndex of loopContext.breakTargets) state.ops[patchIndex] = endTarget;
			} else if (stmt.stmt.type === "do") {
				const loopStart = state.ops.length;
				compileStmt(state, stmt.stmt.body);
				const continueTarget = state.ops.length;
				for (const patchIndex of loopContext.continueTargets) state.ops[patchIndex] = continueTarget;
				compileExpr(state, stmt.stmt.test);
				state.ops.push(AudioVmOp.JumpIfTrue);
				state.ops.push(loopStart);
				const endTarget = state.ops.length;
				for (const patchIndex of loopContext.breakTargets) state.ops[patchIndex] = endTarget;
			} else if (stmt.stmt.type === "for") {
				pushScope(state);
				compileExpr(state, stmt.stmt.from);
				if (state.stack.length === 0) {
					error(state, "for loop start has no value", stmt.stmt.loc);
					popScope(state);
					state.loopStack.pop();
					return;
				}
				const loopVar = declareVariable(state, stmt.stmt.init, stmt.stmt.loc);
				compileSetVariable(state, loopVar, stmt.stmt.from);
				state.stack.pop();
				const loopStart = state.ops.length;
				compileGetVariable(state, loopVar);
				state.stack.push({ expr: {
					type: "identifier",
					name: stmt.stmt.init,
					loc: stmt.stmt.loc
				} });
				compileExpr(state, stmt.stmt.to);
				state.ops.push(AudioVmOp.LessEqual);
				state.stack.pop();
				state.stack.pop();
				state.stack.push({ expr: stmt.stmt.from });
				state.ops.push(AudioVmOp.JumpIfFalse);
				const jumpToEndPatchIndex = state.ops.length;
				state.ops.push(0);
				state.stack.pop();
				compileStmt(state, stmt.stmt.body);
				const continueTarget = state.ops.length;
				for (const patchIndex of loopContext.continueTargets) state.ops[patchIndex] = continueTarget;
				compileGetVariable(state, loopVar);
				state.stack.push({ expr: {
					type: "identifier",
					name: stmt.stmt.init,
					loc: stmt.stmt.loc
				} });
				state.ops.push(AudioVmOp.PushScalar);
				state.ops.push(1);
				state.stack.push({ expr: {
					type: "number",
					value: 1,
					loc: stmt.stmt.loc
				} });
				state.ops.push(AudioVmOp.Add);
				state.stack.pop();
				state.stack.pop();
				state.stack.push({ expr: {
					type: "identifier",
					name: stmt.stmt.init,
					loc: stmt.stmt.loc
				} });
				compileSetVariable(state, loopVar, stmt.stmt.from);
				state.stack.pop();
				state.ops.push(AudioVmOp.Jump);
				state.ops.push(loopStart);
				const endTarget = state.ops.length;
				state.ops[jumpToEndPatchIndex] = endTarget;
				for (const patchIndex of loopContext.breakTargets) state.ops[patchIndex] = endTarget;
				popScope(state);
			} else if (stmt.stmt.type === "for-of") {
				const forOfStmt = stmt.stmt;
				const tempId = state.nextTempId++;
				const arrName = `__arr_${tempId}`;
				const lenName = `__len_${tempId}`;
				const idxName = `__i_${tempId}`;
				compileExpr(state, forOfStmt.iterable);
				if (state.stack.length === 0) {
					error(state, "for-of iterable has no value", forOfStmt.loc);
					state.loopStack.pop();
					return;
				}
				const arrayVar = declareVariable(state, arrName, forOfStmt.loc);
				compileSetVariable(state, arrayVar, forOfStmt.iterable);
				state.stack.pop();
				compileGetVariable(state, arrayVar);
				state.stack.push({ expr: forOfStmt.iterable });
				state.ops.push(AudioVmOp.ArrayLen);
				state.stack.pop();
				state.stack.push({ expr: forOfStmt.iterable });
				const lengthVar = declareVariable(state, lenName, forOfStmt.loc);
				compileSetVariable(state, lengthVar, forOfStmt.iterable);
				state.stack.pop();
				state.ops.push(AudioVmOp.PushScalar);
				state.ops.push(0);
				state.stack.push({ expr: {
					type: "number",
					value: 0,
					loc: forOfStmt.loc
				} });
				const indexVar = declareVariable(state, idxName, forOfStmt.loc);
				compileSetVariable(state, indexVar, forOfStmt.iterable);
				state.stack.pop();
				const loopStart = state.ops.length;
				compileGetVariable(state, indexVar);
				state.stack.push({ expr: {
					type: "identifier",
					name: idxName,
					loc: forOfStmt.loc
				} });
				compileGetVariable(state, lengthVar);
				state.stack.push({ expr: {
					type: "identifier",
					name: lenName,
					loc: forOfStmt.loc
				} });
				state.ops.push(AudioVmOp.Less);
				state.stack.pop();
				state.stack.pop();
				state.stack.push({ expr: forOfStmt.iterable });
				state.ops.push(AudioVmOp.JumpIfFalse);
				const jumpToEndPatchIndex = state.ops.length;
				state.ops.push(0);
				state.stack.pop();
				compileGetVariable(state, arrayVar);
				state.stack.push({ expr: forOfStmt.iterable });
				compileGetVariable(state, indexVar);
				state.stack.push({ expr: {
					type: "identifier",
					name: idxName,
					loc: forOfStmt.loc
				} });
				state.ops.push(AudioVmOp.ArrayGet, 0);
				state.stack.pop();
				state.stack.pop();
				state.stack.push({ expr: {
					type: "identifier",
					name: forOfStmt.value,
					loc: forOfStmt.loc
				} });
				compileSetVariable(state, declareVariable(state, forOfStmt.value, forOfStmt.loc), forOfStmt.iterable);
				state.stack.pop();
				if (forOfStmt.index) {
					compileGetVariable(state, indexVar);
					state.stack.push({ expr: {
						type: "identifier",
						name: idxName,
						loc: forOfStmt.loc
					} });
					compileSetVariable(state, declareVariable(state, forOfStmt.index, forOfStmt.loc), forOfStmt.iterable);
					state.stack.pop();
				}
				if (forOfStmt.length) {
					compileGetVariable(state, lengthVar);
					state.stack.push({ expr: {
						type: "identifier",
						name: lenName,
						loc: forOfStmt.loc
					} });
					compileSetVariable(state, declareVariable(state, forOfStmt.length, forOfStmt.loc), forOfStmt.iterable);
					state.stack.pop();
				}
				compileStmt(state, forOfStmt.body);
				const continueTarget = state.ops.length;
				for (const patchIndex of loopContext.continueTargets) state.ops[patchIndex] = continueTarget;
				compileGetVariable(state, indexVar);
				state.stack.push({ expr: {
					type: "identifier",
					name: idxName,
					loc: forOfStmt.loc
				} });
				state.ops.push(AudioVmOp.PushScalar);
				state.ops.push(1);
				state.stack.push({ expr: {
					type: "number",
					value: 1,
					loc: forOfStmt.loc
				} });
				state.ops.push(AudioVmOp.Add);
				state.stack.pop();
				state.stack.pop();
				state.stack.push({ expr: {
					type: "identifier",
					name: idxName,
					loc: forOfStmt.loc
				} });
				compileSetVariable(state, indexVar, forOfStmt.iterable);
				state.stack.pop();
				state.ops.push(AudioVmOp.Jump);
				state.ops.push(loopStart);
				const endTarget = state.ops.length;
				state.ops[jumpToEndPatchIndex] = endTarget;
				for (const patchIndex of loopContext.breakTargets) state.ops[patchIndex] = endTarget;
			}
			state.loopStack.pop();
		} else compileStmt(state, stmt.stmt);
	}
	function compileThrow(state, stmt) {
		if (stmt.value) compileExpr(state, stmt.value);
		else {
			state.ops.push(AudioVmOp.PushScalar);
			state.ops.push(0);
			state.stack.push({ expr: {
				type: "number",
				value: 0,
				loc: stmt.loc
			} });
		}
		state.ops.push(AudioVmOp.Throw);
		state.stack.pop();
	}
	function compileTry(state, stmt) {
		let catchParamIndex = -1;
		if (stmt.catch) {
			catchParamIndex = state.nextLocalIndex;
			state.nextLocalIndex++;
		}
		state.ops.push(AudioVmOp.PushTryBlock);
		const catchPcIndex = state.ops.length;
		state.ops.push(-1);
		const finallyPcIndex = state.ops.length;
		state.ops.push(-1);
		state.ops.push(catchParamIndex);
		compileStmt(state, stmt.body);
		if (!stmt.finally) state.ops.push(AudioVmOp.PopTryBlock);
		state.ops.push(AudioVmOp.Jump);
		const jumpFromTryIndex = state.ops.length;
		state.ops.push(0);
		const jumpsToFinallyOrEnd = [jumpFromTryIndex];
		if (stmt.catch) {
			const catchStart = state.ops.length;
			state.ops[catchPcIndex] = catchStart;
			pushScope(state);
			const currentScope = getCurrentScope(state);
			if (currentScope) currentScope.set(stmt.catch.param, {
				scope: "local",
				index: catchParamIndex
			});
			if (stmt.catch.body.type === "block") for (const s$1 of stmt.catch.body.body) compileStmt(state, s$1);
			else compileStmt(state, stmt.catch.body);
			popScope(state);
			if (!stmt.finally) state.ops.push(AudioVmOp.PopTryBlock);
			state.ops.push(AudioVmOp.Jump);
			jumpsToFinallyOrEnd.push(state.ops.length);
			state.ops.push(0);
		}
		let finallyStart = -1;
		if (stmt.finally) {
			finallyStart = state.ops.length;
			state.ops[finallyPcIndex] = finallyStart;
			compileStmt(state, stmt.finally);
			state.ops.push(AudioVmOp.PopTryBlock);
		}
		const endTarget = state.ops.length;
		const jumpTarget = stmt.finally ? finallyStart : endTarget;
		for (const index of jumpsToFinallyOrEnd) state.ops[index] = jumpTarget;
	}
	function compileUnaryOp(state, expr) {
		compileExpr(state, expr.expr);
		if (state.stack.length === 0) {
			error(state, "Unary operator requires an operand", expr.loc.line, expr.loc.column);
			return;
		}
		const opCode = {
			"-": AudioVmOp.Neg,
			"!": AudioVmOp.Not,
			"~": AudioVmOp.BitNot
		}[expr.op];
		if (opCode === void 0) {
			error(state, `Unknown unary operator: ${expr.op}`, expr.loc.line, expr.loc.column);
			return;
		}
		state.ops.push(opCode);
		state.stack.pop();
		state.stack.push({ expr });
	}
	function compileBinaryOp(state, expr) {
		compileExpr(state, expr.left);
		compileExpr(state, expr.right);
		const opCode = {
			"+": AudioVmOp.Add,
			"-": AudioVmOp.Sub,
			"*": AudioVmOp.Mul,
			"/": AudioVmOp.Div,
			"%": AudioVmOp.Mod,
			"**": AudioVmOp.Pow,
			">": AudioVmOp.Greater,
			"<": AudioVmOp.Less,
			">=": AudioVmOp.GreaterEqual,
			"<=": AudioVmOp.LessEqual,
			"==": AudioVmOp.Equal,
			"!=": AudioVmOp.NotEqual,
			"&&": AudioVmOp.And,
			"||": AudioVmOp.Or,
			"&": AudioVmOp.BitAnd,
			"|": AudioVmOp.BitOr,
			"^": AudioVmOp.BitXor,
			"<<": AudioVmOp.ShiftLeft,
			">>": AudioVmOp.ShiftRight
		}[expr.op];
		if (opCode === void 0) {
			error(state, `Unknown binary operator: ${expr.op}`, expr.loc.line, expr.loc.column);
			return;
		}
		state.ops.push(opCode);
		state.stack.pop();
		state.stack.pop();
		state.stack.push({ expr });
	}
	function compileTernary(state, expr) {
		compileExpr(state, expr.test);
		state.ops.push(AudioVmOp.JumpIfFalse);
		const jumpToElsePatchIndex = state.ops.length;
		state.ops.push(0);
		compileExpr(state, expr.then);
		state.ops.push(AudioVmOp.Jump);
		const jumpToEndPatchIndex = state.ops.length;
		state.ops.push(0);
		const elseTarget = state.ops.length;
		state.ops[jumpToElsePatchIndex] = elseTarget;
		state.stack.pop();
		compileExpr(state, expr.else);
		const endTarget = state.ops.length;
		state.ops[jumpToEndPatchIndex] = endTarget;
		state.stack[state.stack.length - 1] = { expr };
	}
	function compilePipe(state, expr) {
		compileExpr(state, expr.left);
		if (state.stack.length === 0) {
			error(state, "Pipe operator requires a left-hand value", expr.loc);
			return;
		}
		pushScope(state);
		const pipeName = `__pipe_${state.nextTempId++}`;
		const pipeVar = state.functionDepth === 0 ? (() => {
			const info = {
				scope: "global",
				index: state.nextGlobalIndex++
			};
			getCurrentScope(state).set(pipeName, info);
			return info;
		})() : declareVariable(state, pipeName, expr.loc, true);
		compileSetVariable(state, pipeVar, expr.left);
		state.stack.pop();
		state.pipeVars.push({
			varInfo: pipeVar,
			functionDepth: state.functionDepth
		});
		compileExpr(state, expr.right);
		state.pipeVars.pop();
		popScope(state);
	}
	function compileArray(state, expr) {
		if (expr.items.length === 0) {
			state.ops.push(AudioVmOp.MakeArray);
			state.ops.push(0);
			state.stack.push({ expr });
			return;
		}
		for (const item of expr.items) compileExpr(state, item);
		state.ops.push(AudioVmOp.MakeArray);
		state.ops.push(expr.items.length);
		state.stack.length -= expr.items.length;
		state.stack.push({ expr });
	}
	function compileMember(state, expr) {
		compileExpr(state, expr.object);
		if (state.stack.length === 0) {
			error(state, "Member access requires an object", expr.loc);
			return;
		}
		if (expr.property === "length") {
			state.ops.push(AudioVmOp.ArrayLen);
			state.stack.pop();
			state.stack.push({ expr });
			return;
		} else if (expr.property === "avg" || expr.property === "push" || expr.property === "shuffle" || expr.property === "map") return;
		else error(state, `Unknown property: ${expr.property}`, expr.loc);
	}
	function isTopLevelFnAssign(state, stmt) {
		if (state.functionDepth !== 0) return false;
		if (stmt.type !== "expr" || stmt.expr.type !== "assign") return false;
		const expr = stmt.expr;
		if (expr.left.type !== "identifier") return false;
		return expr.op === "=>" || expr.op === ":=" && expr.right.type === "fn" || expr.op === "=" && expr.right.type === "fn";
	}
	function isDeferredDefStmt(state, stmt) {
		if (!isTopLevelFnAssign(state, stmt)) return false;
		const expr = stmt.expr;
		if (expr.left.type !== "identifier") return false;
		const name = expr.left.name;
		const loc = expr.loc;
		return state.deferredGlobalFunctions.some((d$1) => d$1.name === name && d$1.loc.start === loc.start && d$1.loc.end === loc.end);
	}
	function declareAssignLhs(state, expr) {
		const shadow = expr.op === ":=";
		if (expr.left.type === "destructure") {
			for (const name of expr.left.names) declareVariable(state, name, expr.left.loc, shadow);
			return;
		}
		if (expr.left.type === "identifier") declareVariable(state, expr.left.name, expr.loc, shadow);
	}
	function collectDeferredGlobalFunctions(state, body, atTopLevel = true) {
		for (const stmt of body) {
			if (stmt.type === "block") {
				pushScope(state);
				collectDeferredGlobalFunctions(state, stmt.body, false);
				popScope(state);
				continue;
			}
			if (stmt.type === "expr" && stmt.expr.type === "assign") {
				const assign = stmt.expr;
				const existedBefore = atTopLevel && assign.left.type === "identifier" ? lookupVariable(state, assign.left.name) : null;
				declareAssignLhs(state, assign);
				if (atTopLevel && isTopLevelFnAssign(state, stmt)) {
					if (assign.left.type !== "identifier") continue;
					const name = assign.left.name;
					if (existedBefore) continue;
					if (name === "mix") state.mixDefinitionLoc = assign.loc;
					const varInfo = lookupVariable(state, name);
					if (!varInfo || varInfo.scope !== "global") continue;
					const globalIndex = varInfo.index;
					let fnExpr;
					if (assign.op === "=>") {
						const x$1 = {
							type: "identifier",
							name: "x",
							loc: assign.left.loc
						};
						fnExpr = {
							type: "fn",
							params: [{
								type: "param",
								name: "x",
								loc: assign.left.loc
							}],
							defaults: [null],
							body: {
								type: "binary",
								op: "|>",
								left: x$1,
								right: assign.right,
								loc: assign.right.loc
							},
							loc: assign.loc
						};
					} else {
						if (assign.right.type !== "fn") continue;
						fnExpr = assign.right;
					}
					state.deferredGlobalFunctions.push({
						name,
						fnExpr,
						globalIndex,
						loc: assign.loc
					});
				}
			}
		}
	}
	function compile$1(state, program, preludeLines = 0) {
		state.preludeLines = preludeLines;
		state.ops = [];
		state.errors = [];
		state.stack = [];
		state.functionAliases = /* @__PURE__ */ new Map();
		state.globals = /* @__PURE__ */ new Map();
		state.locals = [];
		state.closureVars = [];
		state.functions = [];
		state.stringExpressions = /* @__PURE__ */ new Map();
		state.functionBytecodes = /* @__PURE__ */ new Map();
		state.loopStack = [];
		state.pipeVars = [];
		state.nextGlobalIndex = 0;
		state.nextLocalIndex = 0;
		state.nextFunctionId = 0;
		state.nextTempId = 0;
		state.inFunction = false;
		state.sampleRegistrations = [];
		state.recordCallbacks = /* @__PURE__ */ new Map();
		state.recordCallbackTemplates = /* @__PURE__ */ new Map();
		state.nextRecordScopeId = 0;
		state.scopeCaptureGlobals = /* @__PURE__ */ new Map();
		state.arrayInitOps = [];
		state.arrayInitRequests = [];
		state.arrayInitPcOffset = 0;
		state.nextRecordGlobalIdx = 1e3;
		state.recordHandleByScopeGlobal = null;
		state.currentRecordScopeIdGlobal = null;
		state.recordCaptureStoresByScopeGlobal = null;
		state.callSiteIdToHandle = /* @__PURE__ */ new Map();
		state.historySourceMap = [];
		state.labels = [];
		state.varToArrayLiteral = /* @__PURE__ */ new Map();
		state.mixDefinitionLoc = null;
		state.scale = "major";
		state.scaleIndex = 0;
		state.rootMidi = 0;
		state.functionBytecodeStarts = /* @__PURE__ */ new Map();
		state.currentFunctionId = null;
		state.deferredGlobalFunctions = [];
		state.functionsByNameStack = [/* @__PURE__ */ new Map()];
		state.oversampleCallbackFunctionIds = /* @__PURE__ */ new Set();
		const recordMapping = assignRecordCallIds(program);
		state.recordCallIds = recordMapping.recordCallIds;
		state.functionToRecordCall = recordMapping.functionToRecordCall;
		state.recordCallExprs = /* @__PURE__ */ new Map();
		collectDeferredGlobalFunctions(state, program.body);
		const deferredNames = new Set(state.deferredGlobalFunctions.map((d$1) => d$1.name));
		const collectAliasesFromAst = (body) => {
			for (const stmt of body) {
				if (stmt.type === "block") {
					collectAliasesFromAst(stmt.body);
					continue;
				}
				if (stmt.type === "expr" && stmt.expr.type === "assign") {
					const assign = stmt.expr;
					if (assign.left.type === "identifier" && assign.right.type === "identifier") {
						const target = assign.right.name;
						if (deferredNames.has(target)) state.functionAliases.set(assign.left.name, target);
					}
				}
			}
		};
		collectAliasesFromAst(program.body);
		state.ops = [];
		state.isDeferredPass = true;
		for (const { name, fnExpr, globalIndex, loc } of state.deferredGlobalFunctions) {
			const prevCaptureGlobals = state.captureGlobalsInClosures;
			if (loc.line <= state.preludeLines) state.captureGlobalsInClosures = true;
			compileFunction(state, fnExpr, name);
			state.captureGlobalsInClosures = prevCaptureGlobals;
			state.ops.push(AudioVmOp.SetGlobal, globalIndex);
			state.stack.pop();
		}
		const deferredOps = state.ops.slice();
		const deferredLength = deferredOps.length;
		state.ops = [];
		state.isDeferredPass = false;
		for (const stmt of program.body) {
			if (isDeferredDefStmt(state, stmt)) continue;
			compileStmt(state, stmt);
		}
		state.ops = deferredOps.concat(state.ops);
		patchPcParamsInRange(state.ops, deferredLength, deferredLength);
		state.arrayInitPcOffset = deferredLength;
		const arrayInitOps = [];
		for (const { capacity, globalIdx } of state.arrayInitRequests) {
			for (let j$1 = 0; j$1 < capacity; j$1++) arrayInitOps.push(AudioVmOp.PushUndefined);
			arrayInitOps.push(AudioVmOp.MakeArray, capacity, AudioVmOp.SetGlobal, globalIdx);
		}
		if (state.recordCaptureStoresByScopeGlobal !== null && state.recordCallbacks.size > 0) {
			const maxScopeId = Math.max(...state.recordCallbacks.keys(), -1);
			for (let scopeId = 0; scopeId <= maxScopeId; scopeId++) {
				const cb = state.recordCallbacks.get(scopeId);
				const numDeps = cb ? cb.recordGlobalIndices.length : 1;
				const capacity = Math.max(1, numDeps);
				for (let j$1 = 0; j$1 < capacity; j$1++) arrayInitOps.push(AudioVmOp.PushUndefined);
				arrayInitOps.push(AudioVmOp.MakeArray, capacity);
			}
			arrayInitOps.push(AudioVmOp.MakeArray, maxScopeId + 1, AudioVmOp.SetGlobal, state.recordCaptureStoresByScopeGlobal);
		}
		state.arrayInitRequests = [];
		const arrayInitOffset = arrayInitOps.length;
		if (arrayInitOffset > 0) for (let i$1 = 0; i$1 < state.historySourceMap.length; i$1++) {
			const entry = state.historySourceMap[i$1];
			if (entry.inFunction && entry.__finalFunctionId !== void 0) {
				if (state.oversampleCallbackFunctionIds.has(entry.__finalFunctionId)) continue;
			}
		}
		if (state.errors.length > 0) return {
			bytecode: null,
			errors: state.errors,
			sampleRegistrations: [],
			recordCallbacks: /* @__PURE__ */ new Map(),
			historySourceMap: [],
			labels: [],
			functionCalls: [],
			bpm: state.bpm
		};
		const postPc = state.ops.length;
		const mixDef = state.mixDefinitionLoc;
		if (mixDef !== null) {
			const mixLine = Math.max(1, mixDef.line - state.preludeLines);
			state.historySourceMap.push({
				line: mixLine,
				column: mixDef.column,
				genName: "Mix",
				pc: postPc,
				inFunction: false
			});
		}
		state.ops.push(AudioVmOp.Post);
		const mixVarInfo = lookupVariable(state, "mix");
		if (mixVarInfo && mixVarInfo.scope === "global") {
			state.ops.push(AudioVmOp.GetGlobal);
			state.ops.push(mixVarInfo.index);
		} else {
			state.ops.push(AudioVmOp.GetGlobal);
			state.ops.push(0);
		}
		state.ops.push(AudioVmOp.CallFunction);
		state.ops.push(1);
		if (state.stack.length > 0) state.stack.pop();
		state.stack.push({ expr: {
			type: "array",
			items: [],
			loc: {
				start: 0,
				end: 0,
				line: 0,
				column: 0
			}
		} });
		const totalLen = arrayInitOffset + state.ops.length;
		const buffer = /* @__PURE__ */ new ArrayBuffer(totalLen * 4);
		const u32View = new Uint32Array(buffer);
		const f32View = new Float32Array(buffer);
		if (arrayInitOffset > 0) {
			encodeToBuffer(arrayInitOps, u32View, f32View, 0, 0);
			encodeToBuffer(state.ops, u32View, f32View, arrayInitOffset, arrayInitOffset);
		} else encodeToBuffer(state.ops, u32View, f32View, 0, 0);
		for (const [funcName, recordCallLocKey] of state.functionToRecordCall.entries()) {
			if (!hasFunctionByName(state, funcName)) continue;
			const recordCallExpr = state.recordCallExprs.get(recordCallLocKey);
			if (recordCallExpr) {
				const args = recordCallExpr.args;
				const secondsArg = args[0]?.type === "arg" ? args[0].value : null;
				if (secondsArg && secondsArg.type === "number") {
					const seconds = Math.max(0, Math.min(10, secondsArg.value));
					const directRecordCallIds = /* @__PURE__ */ new Set();
					for (const [locKey, id] of state.recordCallIds.entries()) if (state.recordCallExprs.has(locKey)) directRecordCallIds.add(id);
					for (const [callSiteLocKey, callSiteId] of state.recordCallIds.entries()) {
						if (directRecordCallIds.has(callSiteId)) continue;
						if (!state.recordCallbacks.has(callSiteId)) continue;
						if (!state.sampleRegistrations.some((reg) => reg.type === "record" && reg.recordCallbackId === callSiteId)) {
							const handle = sampleManager.registerRecord(state.projectId, seconds, callSiteId);
							state.sampleRegistrations.push({
								handle,
								type: "record",
								recordSeconds: seconds,
								recordCallbackId: callSiteId
							});
						}
					}
				}
			}
		}
		for (const entry of state.historySourceMap) entry.pc += arrayInitOffset + (entry.__fromMainProgram ? state.arrayInitPcOffset : 0);
		const functionReturnPcs = {};
		for (const [name, funcInfo] of functionsByNameEntries(state)) {
			const idx = funcInfo.returnHistorySourceMapIndex;
			if (idx != null) {
				const entry = state.historySourceMap[idx];
				if (entry) functionReturnPcs[name] = entry.pc;
			}
		}
		return {
			bytecode: f32View,
			errors: [],
			sampleRegistrations: state.sampleRegistrations,
			historySourceMap: state.historySourceMap,
			labels: state.labels,
			recordCallbacks: state.recordCallbacks,
			functionReturnPcs,
			functionCalls: state.functionCallsMeta,
			bpm: state.bpm
		};
	}
	function compileStmt(state, stmt) {
		switch (stmt.type) {
			case "expr":
				compileExpr(state, stmt.expr);
				break;
			case "block":
				pushScope(state);
				for (const s$1 of stmt.body) compileStmt(state, s$1);
				popScope(state);
				break;
			case "return":
				if (stmt.value) compileExpr(state, stmt.value);
				else {
					state.ops.push(AudioVmOp.PushScalar);
					state.ops.push(0);
					state.stack.push({ expr: {
						type: "number",
						value: 0,
						loc: stmt.loc
					} });
				}
				state.ops.push(AudioVmOp.Return);
				break;
			case "if":
				compileIf(state, stmt);
				break;
			case "while":
				compileWhile(state, stmt);
				break;
			case "do":
				compileDoWhile(state, stmt);
				break;
			case "for":
				compileFor(state, stmt);
				break;
			case "for-of":
				compileForOf(state, stmt);
				break;
			case "break":
				compileBreak(state, stmt);
				break;
			case "continue":
				compileContinue(state, stmt);
				break;
			case "label":
				compileLabel(state, stmt);
				break;
			case "throw":
				compileThrow(state, stmt);
				break;
			case "try":
				compileTry(state, stmt);
				break;
			default: error(state, `Unsupported statement type: ${stmt.type}`, stmt.loc);
		}
	}
	const OUT_SOLO_BUILTINS = new Set(["out", "solo"]);
	function isKnownBuiltinName(name) {
		return getBuiltinSpec(name) !== null || OUT_SOLO_BUILTINS.has(name);
	}
	function getBuiltinSpec(name) {
		const byVariant = genSpecs.find((s$1) => s$1.variantName === name);
		if (byVariant) return byVariant;
		const genName = name.charAt(0).toUpperCase() + name.slice(1);
		return genSpecs.find((s$1) => s$1.genName === genName && s$1.variantName === "default") ?? null;
	}
	function compileBuiltinAsValue(state, builtinName, loc) {
		if (OUT_SOLO_BUILTINS.has(builtinName)) {
			compileFunction(state, {
				type: "fn",
				params: [{
					type: "param",
					name: "in",
					loc
				}, {
					type: "param",
					name: "name",
					loc
				}],
				defaults: [null, {
					type: "identifier",
					name: "undefined",
					loc
				}],
				body: {
					type: "call",
					callee: {
						type: "identifier",
						name: builtinName,
						loc
					},
					args: [{
						type: "arg",
						value: {
							type: "identifier",
							name: "in",
							loc
						},
						shorthand: true,
						loc
					}, {
						type: "arg",
						value: {
							type: "identifier",
							name: "name",
							loc
						},
						shorthand: true,
						loc
					}],
					loc
				},
				loc
			}, null);
			return;
		}
		const spec = getBuiltinSpec(builtinName);
		if (!spec) return;
		const paramNames = spec.usesInput ? ["in", ...spec.paramNames] : spec.paramNames;
		const params = paramNames.map((name) => ({
			type: "param",
			name,
			loc
		}));
		const callArgs = paramNames.map((name) => ({
			type: "arg",
			value: {
				type: "identifier",
				name,
				loc
			},
			shorthand: true,
			loc
		}));
		compileFunction(state, {
			type: "fn",
			params,
			body: {
				type: "call",
				callee: {
					type: "identifier",
					name: builtinName,
					loc
				},
				args: callArgs,
				loc
			},
			loc
		}, null);
	}
	function compileExpr(state, expr) {
		switch (expr.type) {
			case "number":
				state.ops.push(AudioVmOp.PushScalar);
				state.ops.push(expr.value);
				state.stack.push({ expr });
				break;
			case "string":
				const stringKey = `${expr.loc.start}:${expr.loc.end}:${expr.loc.line}:${expr.loc.column}`;
				state.stringExpressions.set(stringKey, {
					value: expr.value,
					delimiter: expr.delimiter,
					loc: expr.loc
				});
				state.stack.push({ expr });
				break;
			case "identifier":
				if (expr.name === "$") {
					const pipe = state.pipeVars[state.pipeVars.length - 1];
					if (!pipe) {
						error(state, "$ used outside of a pipe", expr.loc);
						return;
					}
					if (pipe.functionDepth === state.functionDepth) compileGetVariable(state, pipe.varInfo);
					else {
						const varInfo = lookupVariable(state, "$");
						if (!varInfo) {
							error(state, "$ used outside of a pipe", expr.loc);
							return;
						}
						compileGetVariable(state, varInfo);
					}
					state.stack.push({ expr });
				} else if (expr.name.startsWith("#")) {
					compileHashVar(state, expr.name, expr.loc);
					state.stack.push({ expr });
				} else {
					const varInfo = lookupVariable(state, expr.name);
					if (varInfo) {
						compileGetVariable(state, varInfo);
						state.stack.push({ expr });
					} else if (isNoteName(expr.name)) {
						compileNoteVar(state, expr.name, expr.loc);
						state.stack.push({ expr });
					} else if (isKnownBuiltinName(expr.name)) {
						compileBuiltinAsValue(state, expr.name, expr.loc);
						state.stack.push({ expr });
					} else error(state, `Unknown identifier: ${expr.name}`, expr.loc);
				}
				break;
			case "array":
				compileArray(state, expr);
				break;
			case "index": {
				const idx = expr;
				compileGetCall(state, idx.object, idx.index, idx.loc, idx);
				break;
			}
			case "member":
				compileMember(state, expr);
				break;
			case "fn":
				compileFunction(state, expr, null);
				break;
			case "assign":
				compileAssign(state, expr);
				break;
			case "call":
				compileCall(state, expr);
				break;
			case "unary":
				compileUnaryOp(state, expr);
				break;
			case "binary":
				if (expr.op === "|>") compilePipe(state, expr);
				else compileBinaryOp(state, expr);
				break;
			case "ternary":
				compileTernary(state, expr);
				break;
			case "destructure":
				error(state, "Destructuring pattern can only be used in assignments", expr.loc);
				break;
			default: error(state, `Unsupported expression type: ${expr.type}`, expr.loc);
		}
	}
	function error(state, message, loc) {
		state.errors.push({
			message,
			loc
		});
	}
	function pushScope(state) {
		state.locals.push(/* @__PURE__ */ new Map());
	}
	function popScope(state) {
		state.locals.pop();
	}
	function getCurrentScope(state) {
		return state.locals.length > 0 ? state.locals[state.locals.length - 1] : null;
	}
	var State = class {
		arrayInitOps = [];
		arrayInitPcOffset = 0;
		arrayInitRequests = [];
		callSiteIdToHandle = /* @__PURE__ */ new Map();
		captureGlobalsInClosures = false;
		scopeCaptureGlobals = /* @__PURE__ */ new Map();
		nextRecordScopeId = 0;
		closureVars = [];
		compilingRecordCallback = false;
		currentFunctionId = null;
		deferredGlobalFunctions = [];
		errors = [];
		functionCallsMeta = [];
		functionBytecodes = /* @__PURE__ */ new Map();
		functionBytecodeStarts = /* @__PURE__ */ new Map();
		functionDepth = 0;
		functions = [];
		functionAliases = /* @__PURE__ */ new Map();
		functionsByNameStack = [/* @__PURE__ */ new Map()];
		functionToRecordCall = /* @__PURE__ */ new Map();
		functionIdToDefaultParamFunctions = /* @__PURE__ */ new Map();
		globals = /* @__PURE__ */ new Map();
		historySourceMap = [];
		labels = [];
		mixDefinitionLoc = null;
		isDeferredPass = false;
		inFunction = false;
		paramNameToLocalIndex = null;
		locals = [];
		loopStack = [];
		nextFunctionId = 0;
		nextGlobalIndex = 0;
		nextLocalIndex = 0;
		nextRecordGlobalIdx = 1e3;
		nextAllocCallSiteId = 0;
		nextStepCallSiteId = 0;
		nextTempId = 0;
		ops = [];
		oversampleCallbackFunctionIds = /* @__PURE__ */ new Set();
		pipeVars = [];
		preludeLines = 0;
		recordCallbacks = /* @__PURE__ */ new Map();
		recordCallbackTemplates = /* @__PURE__ */ new Map();
		recordCallExprs = /* @__PURE__ */ new Map();
		recordCallIds = /* @__PURE__ */ new Map();
		recordHandleByScopeGlobal = null;
		currentRecordScopeIdGlobal = null;
		recordCaptureStoresByScopeGlobal = null;
		sampleRegistrations = [];
		projectId = null;
		seenCallSites = /* @__PURE__ */ new Set();
		stack = [];
		stringExpressions = /* @__PURE__ */ new Map();
		bpm = 120;
		varToArrayLiteral = /* @__PURE__ */ new Map();
		scale = "major";
		scaleIndex = 0;
		rootMidi = 0;
	};
	function disassembleBytecode(bytecode, indent$1 = 0) {
		const lines = [];
		const u32 = new Uint32Array(bytecode.buffer, bytecode.byteOffset, bytecode.length);
		let pc = 0;
		const pad = "  ".repeat(indent$1);
		while (pc < bytecode.length) {
			const opcode = u32[pc];
			const info = getOpcodeInfo(opcode);
			const name = AudioVmOp[opcode] ?? `Unknown(${opcode})`;
			const here = pc++;
			switch (info.kind) {
				case "param":
				case "pc-param": {
					const param = Math.round(bytecode[pc]);
					const suffix = name === "CallFunction" ? ` arg(s)` : "";
					lines.push(`${pad}${here}: ${name} ${param}${suffix}`);
					pc++;
					break;
				}
				case "three-param":
					lines.push(`${pad}${here}: ${name} ${Math.round(bytecode[pc])} ${Math.round(bytecode[pc + 1])} ${Math.round(bytecode[pc + 2])}`);
					pc += 3;
					break;
				case "table": {
					const len = Math.round(bytecode[pc]);
					lines.push(`${pad}${here}: ${name} len=${len}`);
					pc += 1 + len;
					break;
				}
				case "define-function": {
					const id = Math.round(bytecode[pc]);
					const paramCount = Math.round(bytecode[pc + 1]);
					const firstParamIn = Math.round(bytecode[pc + 2]);
					const closureCount = Math.round(bytecode[pc + 3]);
					const localCount = Math.round(bytecode[pc + 4]);
					const len = Math.round(bytecode[pc + 5]);
					lines.push(`${pad}${here}: ${name} id=${id} paramCount=${paramCount} firstParamIn=${firstParamIn} closureCount=${closureCount} localCount=${localCount} len=${len}`);
					pc += 6;
					lines.push(...disassembleBytecode(bytecode.subarray(pc, pc + len), indent$1 + 1));
					pc += len;
					break;
				}
				case "none":
					lines.push(`${pad}${here}: ${name}`);
					break;
			}
		}
		return lines;
	}
	function compile(program, preludeLines = 0, opts) {
		const state = new State();
		if (opts?.projectId !== void 0) state.projectId = opts.projectId;
		return compile$1(state, program, preludeLines);
	}
	const ASSIGN_OPS = new Set([
		"=",
		":=",
		"=>",
		"+=",
		"-=",
		"*=",
		"/=",
		"%=",
		"**=",
		"&=",
		"|=",
		"^=",
		"<<=",
		">>="
	]);
	const BIN_PREC = {
		"||": { prec: 2 },
		"&&": { prec: 3 },
		"|": { prec: 3.5 },
		"^": { prec: 3.7 },
		"&": { prec: 3.9 },
		"==": { prec: 4 },
		"!=": { prec: 4 },
		"<": { prec: 5 },
		"<=": { prec: 5 },
		">": { prec: 5 },
		">=": { prec: 5 },
		"<<": { prec: 5.5 },
		">>": { prec: 5.5 },
		"+": { prec: 6 },
		"-": { prec: 6 },
		"*": { prec: 7 },
		"/": { prec: 7 },
		"%": { prec: 7 },
		"**": {
			prec: 8,
			right: true
		}
	};
	function parseTokens(input, tokens) {
		const p$1 = new Parser(input, tokens);
		let program = null;
		try {
			program = p$1.parseProgram();
		} catch (e$1) {
			if (p$1.errors.length === 0) p$1.error("Parse error: " + (e$1 instanceof Error ? e$1.message : String(e$1)));
		}
		return {
			program,
			errors: p$1.errors
		};
	}
	function collectNumberLiterals(program) {
		const out = [];
		const walkExpr = (e$1) => {
			if (e$1.type === "number") {
				out.push(e$1);
				return;
			}
			switch (e$1.type) {
				case "string":
				case "identifier":
				case "destructure": return;
				case "array":
					for (const it of e$1.items) walkExpr(it);
					return;
				case "index":
					walkExpr(e$1.object);
					walkExpr(e$1.index);
					return;
				case "member":
					walkExpr(e$1.object);
					return;
				case "unary":
					walkExpr(e$1.expr);
					return;
				case "binary":
					walkExpr(e$1.left);
					walkExpr(e$1.right);
					return;
				case "ternary":
					walkExpr(e$1.test);
					walkExpr(e$1.then);
					walkExpr(e$1.else);
					return;
				case "call":
					walkExpr(e$1.callee);
					for (const a$1 of e$1.args) if (a$1.type === "arg") walkExpr(a$1.value);
					return;
				case "assign":
					walkExpr(e$1.left);
					walkExpr(e$1.right);
					return;
				case "fn":
					for (const d$1 of e$1.defaults ?? []) if (d$1) walkExpr(d$1);
					if (e$1.body.type === "block") walkStmt(e$1.body);
					else walkExpr(e$1.body);
					return;
				default: return;
			}
		};
		const walkStmt = (s$1) => {
			switch (s$1.type) {
				case "expr":
					walkExpr(s$1.expr);
					return;
				case "block":
					for (const it of s$1.body) walkStmt(it);
					return;
				case "if":
					walkExpr(s$1.test);
					walkStmt(s$1.then);
					if (s$1.else) walkStmt(s$1.else);
					return;
				case "while":
				case "do":
					walkExpr(s$1.test);
					walkStmt(s$1.body);
					return;
				case "for":
					walkExpr(s$1.from);
					walkExpr(s$1.to);
					walkStmt(s$1.body);
					return;
				case "for-of":
					walkExpr(s$1.iterable);
					walkStmt(s$1.body);
					return;
				case "return":
				case "throw":
					if (s$1.value) walkExpr(s$1.value);
					return;
				case "try":
					walkStmt(s$1.body);
					if (s$1.catch) walkStmt(s$1.catch.body);
					if (s$1.finally) walkStmt(s$1.finally);
					return;
				case "label":
					walkStmt(s$1.stmt);
					return;
				case "break":
				case "continue": return;
			}
		};
		for (const stmt of program.body) walkStmt(stmt);
		return out;
	}
	var Parser = class {
		errors = [];
		pos = 0;
		guard = 0;
		guardMax;
		hasFatalError = false;
		constructor(input, tokens) {
			this.input = input;
			this.tokens = tokens;
			this.guardMax = tokens.length * 16 + 1024;
		}
		checkUnmatchedBraces() {
			let braceDepth = 0;
			let parenDepth = 0;
			let bracketDepth = 0;
			const openBraces = [];
			const openParens = [];
			const openBrackets = [];
			for (let i$1 = 0; i$1 < this.tokens.length; i$1++) {
				const tok = this.tokens[i$1];
				if (tok.type === "eof") break;
				if (tok.type === "punct") {
					const val = String(tok.value);
					if (val === "{") {
						braceDepth++;
						openBraces.push(tok);
					} else if (val === "}") {
						braceDepth--;
						if (braceDepth < 0) return {
							message: `Unmatched closing brace "}"`,
							token: tok
						};
						openBraces.pop();
					} else if (val === "(") {
						parenDepth++;
						openParens.push(tok);
					} else if (val === ")") {
						parenDepth--;
						if (parenDepth < 0) return {
							message: `Unmatched closing parenthesis ")"`,
							token: tok
						};
						openParens.pop();
					} else if (val === "[") {
						bracketDepth++;
						openBrackets.push(tok);
					} else if (val === "]") {
						bracketDepth--;
						if (bracketDepth < 0) return {
							message: `Unmatched closing bracket "]"`,
							token: tok
						};
						openBrackets.pop();
					}
				}
			}
			if (braceDepth > 0 && openBraces.length > 0) return {
				message: `Unclosed brace "{"`,
				token: openBraces[openBraces.length - 1]
			};
			if (parenDepth > 0 && openParens.length > 0) return {
				message: `Unclosed parenthesis "("`,
				token: openParens[openParens.length - 1]
			};
			if (bracketDepth > 0 && openBrackets.length > 0) return {
				message: `Unclosed bracket "["`,
				token: openBrackets[openBrackets.length - 1]
			};
			return null;
		}
		tick() {
			this.guard++;
			if (this.guard > this.guardMax) {
				const braceError = this.checkUnmatchedBraces();
				if (braceError) this.error(braceError.message, braceError.token);
				else this.error("Parser exceeded max steps (possible infinite loop). Check for unmatched braces, parentheses, or brackets.");
				throw new Error("parse guard");
			}
		}
		at() {
			const t$1 = this.tokens[this.pos];
			if (t$1 === void 0) throw new Error("Parser invariant: pos out of range");
			return t$1;
		}
		prev() {
			if (this.pos <= 0) throw new Error("Parser invariant: prev at start");
			return this.tokens[this.pos - 1];
		}
		is(type, value) {
			const t$1 = this.at();
			if (t$1.type !== type) return false;
			if (value === void 0) return true;
			return t$1.value === value;
		}
		eat(type, value) {
			const t$1 = this.at();
			if (t$1.type !== type || value !== void 0 && t$1.value !== value) return null;
			this.pos++;
			return t$1;
		}
		expect(type, value, message) {
			const t$1 = this.at();
			if (t$1.type === type && (value === void 0 || t$1.value === value)) {
				this.pos++;
				return t$1;
			}
			this.error(message ?? `Expected ${value ?? type}`);
			return t$1;
		}
		error(message, tok = this.at()) {
			this.errors.push({
				message,
				loc: {
					start: tok.start,
					end: tok.end,
					line: tok.line,
					column: tok.column
				},
				code: this.input.slice(tok.start, Math.min(this.input.length, tok.start + 80))
			});
		}
		locFrom(start, end) {
			return {
				start: start.start,
				end: end.end,
				line: start.line,
				column: start.column
			};
		}
		parseProgram() {
			const braceError = this.checkUnmatchedBraces();
			if (braceError) {
				this.error(braceError.message, braceError.token);
				this.hasFatalError = true;
				this.at();
				this.prev();
				throw new Error("parse error");
			}
			const start = this.at();
			const body = [];
			while (!this.is("eof") && !this.hasFatalError) {
				this.tick();
				if (this.is("punct", ";")) {
					this.pos++;
					continue;
				}
				const stmt = this.parseStmt();
				if (stmt) body.push(stmt);
				this.eat("punct", ";");
			}
			const end = this.prev();
			return {
				type: "program",
				body,
				loc: this.locFrom(start, end)
			};
		}
		syncStmt() {
			if (this.hasFatalError) return;
			const startLine = this.at().line;
			while (!this.is("eof") && !this.hasFatalError) {
				this.tick();
				if (this.is("punct", ";") || this.is("punct", "}")) return;
				if (this.at().line > startLine) return;
				this.pos++;
			}
		}
		parseStmt() {
			if (this.hasFatalError) return null;
			const t$1 = this.at();
			if (this.eat("punct", "{")) {
				const body = [];
				while (!this.is("eof") && !this.is("punct", "}") && !this.hasFatalError) {
					this.tick();
					if (this.is("punct", ";")) {
						this.pos++;
						continue;
					}
					const stmt = this.parseStmt();
					if (stmt) body.push(stmt);
					this.eat("punct", ";");
				}
				if (this.hasFatalError) return null;
				const endTok = this.expect("punct", "}", "Unclosed block");
				return {
					type: "block",
					body,
					loc: this.locFrom(t$1, endTok)
				};
			}
			if (this.eat("keyword", "if")) {
				const start = t$1;
				this.expect("punct", "(", "Expected \"(\" after if");
				const test = this.parseExpr();
				this.expect("punct", ")", "Expected \")\" after if condition");
				const then = this.parseStmt() ?? {
					type: "block",
					body: [],
					loc: this.locFrom(this.prev(), this.prev())
				};
				let elseBranch;
				if (this.eat("keyword", "else")) elseBranch = this.parseStmt() ?? {
					type: "block",
					body: [],
					loc: this.locFrom(this.prev(), this.prev())
				};
				const end = elseBranch ? elseBranch.loc : then.loc;
				return {
					type: "if",
					test,
					then,
					else: elseBranch,
					loc: {
						start: start.start,
						end: end.end,
						line: start.line,
						column: start.column
					}
				};
			}
			if (this.eat("keyword", "while")) {
				const start = t$1;
				this.expect("punct", "(", "Expected \"(\" after while");
				const test = this.parseExpr();
				this.expect("punct", ")", "Expected \")\" after while condition");
				return {
					type: "while",
					test,
					body: this.parseStmt() ?? {
						type: "block",
						body: [],
						loc: this.locFrom(this.prev(), this.prev())
					},
					loc: this.locFrom(start, this.prev())
				};
			}
			if (this.eat("keyword", "do")) {
				const start = t$1;
				const body = this.parseStmt() ?? {
					type: "block",
					body: [],
					loc: this.locFrom(this.prev(), this.prev())
				};
				this.expect("keyword", "while", "Expected \"while\" after do body");
				this.expect("punct", "(", "Expected \"(\" after while");
				const test = this.parseExpr();
				this.expect("punct", ")", "Expected \")\" after while condition");
				return {
					type: "do",
					body,
					test,
					loc: this.locFrom(start, this.prev())
				};
			}
			if (this.eat("keyword", "for")) {
				const start = t$1;
				this.expect("punct", "(", "Expected \"(\" after for");
				const nameTok = this.expect("identifier", void 0, "Expected loop variable name");
				const name = String(nameTok.value);
				if (this.eat("keyword", "in")) {
					const from = this.parseExpr();
					this.expect("operator", "..", "Expected \"..\" range in for loop");
					const to = this.parseExpr();
					this.expect("punct", ")", "Expected \")\" after for loop");
					return {
						type: "for",
						init: name,
						from,
						to,
						body: this.parseStmt() ?? {
							type: "block",
							body: [],
							loc: this.locFrom(this.prev(), this.prev())
						},
						loc: this.locFrom(start, this.prev())
					};
				} else {
					let indexName;
					let lengthName;
					if (this.eat("punct", ",")) {
						const indexTok = this.expect("identifier", void 0, "Expected index variable name");
						indexName = String(indexTok.value);
						if (this.eat("punct", ",")) {
							const lengthTok = this.expect("identifier", void 0, "Expected length variable name");
							lengthName = String(lengthTok.value);
						}
					}
					if (!this.eat("keyword", "of")) {
						this.error("Expected \"in\" or \"of\" in for loop");
						return {
							type: "block",
							body: [],
							loc: this.locFrom(start, start)
						};
					}
					const iterable = this.parseExpr();
					this.expect("punct", ")", "Expected \")\" after for-of loop");
					const body = this.parseStmt() ?? {
						type: "block",
						body: [],
						loc: this.locFrom(this.prev(), this.prev())
					};
					return {
						type: "for-of",
						value: name,
						index: indexName,
						length: lengthName,
						iterable,
						body,
						loc: this.locFrom(start, this.prev())
					};
				}
			}
			if (this.eat("keyword", "return")) {
				const start = t$1;
				if (this.is("punct", ";") || this.is("punct", "}") || this.is("eof")) return {
					type: "return",
					loc: this.locFrom(start, start)
				};
				return {
					type: "return",
					value: this.parseExpr(),
					loc: this.locFrom(start, this.prev())
				};
			}
			if (this.eat("keyword", "break")) {
				const start = t$1;
				const label = this.is("identifier") ? String(this.at().value) : void 0;
				if (label) this.pos++;
				return {
					type: "break",
					label,
					loc: this.locFrom(start, this.prev())
				};
			}
			if (this.eat("keyword", "continue")) {
				const start = t$1;
				const label = this.is("identifier") ? String(this.at().value) : void 0;
				if (label) this.pos++;
				return {
					type: "continue",
					label,
					loc: this.locFrom(start, this.prev())
				};
			}
			if (this.eat("keyword", "throw")) {
				const start = t$1;
				if (this.is("punct", ";") || this.is("punct", "}") || this.is("eof")) return {
					type: "throw",
					loc: this.locFrom(start, start)
				};
				return {
					type: "throw",
					value: this.parseExpr(),
					loc: this.locFrom(start, this.prev())
				};
			}
			if (this.eat("keyword", "try")) {
				const start = t$1;
				const body = this.parseStmt();
				if (!body) {
					this.error("Expected statement after try");
					return {
						type: "block",
						body: [],
						loc: this.locFrom(start, start)
					};
				}
				let catchClause;
				let finallyClause;
				if (this.eat("keyword", "catch")) {
					this.expect("punct", "(", "Expected \"(\" after catch");
					const paramTok = this.expect("identifier", void 0, "Expected parameter name in catch");
					const param = String(paramTok.value);
					this.expect("punct", ")", "Expected \")\" after catch parameter");
					const catchBody = this.parseStmt();
					if (!catchBody) this.error("Expected statement after catch");
					else catchClause = {
						param,
						body: catchBody
					};
				}
				if (this.eat("keyword", "finally")) {
					const finallyBody = this.parseStmt();
					if (!finallyBody) this.error("Expected statement after finally");
					else finallyClause = finallyBody;
				}
				if (!catchClause && !finallyClause) this.error("try statement must have catch or finally clause");
				return {
					type: "try",
					body,
					catch: catchClause,
					finally: finallyClause,
					loc: this.locFrom(start, this.prev())
				};
			}
			if (this.is("identifier") && this.tokens[this.pos + 1]?.type === "punct" && this.tokens[this.pos + 1]?.value === ":") {
				const nameTok = this.eat("identifier");
				this.eat("punct", ":");
				const stmt = this.parseStmt();
				if (!stmt) {
					this.error("Expected statement after label");
					this.syncStmt();
					return null;
				}
				return {
					type: "label",
					name: String(nameTok.value),
					stmt,
					loc: this.locFrom(nameTok, this.prev())
				};
			}
			if (this.hasFatalError) return null;
			try {
				const expr = this.parseExpr();
				return {
					type: "expr",
					expr,
					loc: expr.loc
				};
			} catch {
				if (this.hasFatalError) return null;
				this.syncStmt();
				return null;
			}
		}
		parseExpr() {
			return this.parsePipe();
		}
		parsePipe() {
			const left = this.parseAssign();
			if (!this.eat("operator", "|>")) return left;
			this.prev();
			return {
				type: "binary",
				op: "|>",
				left,
				right: this.parsePipe(),
				loc: this.locFrom(this.tokenFromLoc(left.loc), this.prev())
			};
		}
		parseAssign() {
			const left = this.parseTernary();
			if (this.is("operator") && ASSIGN_OPS.has(String(this.at().value))) {
				const opTok = this.at();
				let destructureLeft = null;
				if (left.type === "array" && left.items.every((item) => item.type === "identifier")) destructureLeft = {
					type: "destructure",
					names: left.items.map((item) => item.name),
					loc: left.loc
				};
				this.pos++;
				const op = String(opTok.value);
				const right = op === "=>" ? this.parsePipe() : this.parseAssign();
				return {
					type: "assign",
					op,
					left: destructureLeft || left,
					right,
					loc: this.locFrom(left.loc ? {
						...opTok,
						start: left.loc.start,
						line: left.loc.line,
						column: left.loc.column
					} : opTok, this.prev())
				};
			}
			return left;
		}
		parseTernary() {
			const test = this.parseBinary(0);
			if (!this.eat("punct", "?")) return test;
			const then = this.parseExpr();
			this.expect("punct", ":", "Expected \":\" in ternary expression");
			return {
				type: "ternary",
				test,
				then,
				else: this.parseExpr(),
				loc: this.locFrom(this.tokenFromLoc(test.loc), this.prev())
			};
		}
		parseBinary(minPrec) {
			let left = this.parseUnary();
			while (true) {
				this.tick();
				const t$1 = this.at();
				if (t$1.type !== "operator") break;
				const op = String(t$1.value);
				const info = BIN_PREC[op];
				if (!info) break;
				if (info.prec < minPrec) break;
				this.pos++;
				const nextMin = info.right ? info.prec : info.prec + 1;
				const right = this.parseBinary(nextMin);
				left = {
					type: "binary",
					op,
					left,
					right,
					loc: this.locFrom(this.tokenFromLoc(left.loc), this.prev())
				};
			}
			return left;
		}
		parseUnary() {
			const t$1 = this.at();
			if (t$1.type === "operator" && (t$1.value === "!" || t$1.value === "-" || t$1.value === "+")) {
				this.pos++;
				const expr = this.parseUnary();
				return {
					type: "unary",
					op: String(t$1.value),
					expr,
					loc: this.locFrom(t$1, this.prev())
				};
			}
			return this.parsePostfix();
		}
		parsePostfix() {
			let expr = this.parsePrimary();
			while (true) {
				this.tick();
				const before = this.pos;
				if (this.eat("punct", ".")) {
					const prop = this.expect("identifier", void 0, "Expected property name after \".\"");
					expr = {
						type: "member",
						object: expr,
						property: String(prop.value),
						loc: this.locFrom(this.tokenFromLoc(expr.loc), prop)
					};
					continue;
				}
				if (this.eat("punct", "[")) {
					this.prev();
					const index = this.parseExpr();
					const end = this.expect("punct", "]", "Expected \"]\" to close index");
					expr = {
						type: "index",
						object: expr,
						index,
						loc: this.locFrom(this.tokenFromLoc(expr.loc), end)
					};
					continue;
				}
				if (this.eat("punct", "(")) {
					const args = [];
					this.prev();
					while (!this.is("eof") && !this.is("punct", ")")) {
						this.tick();
						const argStart = this.at();
						if ((this.is("identifier") || this.is("keyword") && this.at().value === "in") && this.tokens[this.pos + 1]?.type === "punct" && this.tokens[this.pos + 1]?.value === ":") {
							const nameTok = this.at();
							this.pos++;
							this.eat("punct", ":");
							const value = this.parseExpr();
							args.push({
								type: "arg",
								name: String(nameTok.value),
								value,
								loc: this.locFrom(argStart, this.prev())
							});
						} else {
							const value = this.parseExpr();
							const shorthand = value.type === "identifier";
							args.push({
								type: "arg",
								value,
								shorthand,
								loc: this.locFrom(argStart, this.prev())
							});
						}
						if (!this.eat("punct", ",")) break;
					}
					const end = this.expect("punct", ")", "Expected \")\" to close call");
					expr = {
						type: "call",
						callee: expr,
						args,
						loc: this.locFrom(this.tokenFromLoc(expr.loc), end)
					};
					continue;
				}
				if (this.pos === before) break;
				break;
			}
			return expr;
		}
		parsePrimary() {
			const t$1 = this.at();
			if (t$1.type === "number") {
				this.pos++;
				return {
					type: "number",
					value: Number(t$1.value),
					loc: this.locFrom(t$1, t$1)
				};
			}
			if (t$1.type === "string") {
				this.pos++;
				const delimiter = t$1.stringDelimiter ?? "double";
				return {
					type: "string",
					value: String(t$1.value),
					delimiter,
					loc: this.locFrom(t$1, t$1)
				};
			}
			if (t$1.type === "keyword") {
				if (t$1.value === "true" || t$1.value === "false" || t$1.value === "null") {
					this.pos++;
					return {
						type: "number",
						value: t$1.value === "true" ? 1 : t$1.value === "false" ? 0 : 0,
						loc: this.locFrom(t$1, t$1)
					};
				}
				if (t$1.value === "in") {
					const nameTok = t$1;
					const name = String(t$1.value);
					const next = this.tokens[this.pos + 1];
					if (next?.type === "operator" && next.value === "->") {
						this.pos += 2;
						const body = this.parseFnBody();
						return {
							type: "fn",
							params: [{
								type: "param",
								name,
								loc: this.locFrom(nameTok, nameTok)
							}],
							defaults: [null],
							body,
							loc: this.locFrom(nameTok, this.prev())
						};
					}
					this.pos++;
					return {
						type: "identifier",
						name,
						loc: this.locFrom(nameTok, nameTok)
					};
				}
			}
			if (t$1.type === "identifier") {
				const nameTok = t$1;
				const name = String(t$1.value);
				const next = this.tokens[this.pos + 1];
				if (next?.type === "operator" && next.value === "->") {
					this.pos += 2;
					const body = this.parseFnBody();
					return {
						type: "fn",
						params: [{
							type: "param",
							name,
							loc: this.locFrom(nameTok, nameTok)
						}],
						defaults: [null],
						body,
						loc: this.locFrom(nameTok, this.prev())
					};
				}
				this.pos++;
				return {
					type: "identifier",
					name,
					loc: this.locFrom(nameTok, nameTok)
				};
			}
			if (this.eat("punct", "[")) {
				const start = t$1;
				const items = [];
				while (!this.is("eof") && !this.is("punct", "]")) {
					items.push(this.parseExpr());
					if (!this.eat("punct", ",")) break;
				}
				const end = this.expect("punct", "]", "Expected \"]\" to close array literal");
				return {
					type: "array",
					items,
					loc: this.locFrom(start, end)
				};
			}
			if (this.eat("punct", "(")) {
				const startPos = this.pos;
				const start = this.prev();
				const parsedParams = this.tryParseFnParamsUntilCloseParen();
				if (parsedParams) {
					const arrow = this.at();
					if (arrow.type === "operator" && arrow.value === "->") {
						this.pos++;
						const body = this.parseFnBody();
						return {
							type: "fn",
							params: parsedParams.params,
							defaults: parsedParams.defaults,
							body,
							loc: this.locFrom(start, this.prev())
						};
					}
					this.pos = startPos;
				}
				const expr = this.parseExpr();
				this.expect("punct", ")", "Expected \")\"");
				return {
					...expr,
					loc: this.locFrom(start, this.prev())
				};
			}
			this.error("Unexpected token in expression");
			this.hasFatalError = true;
			throw new Error("parse error");
		}
		parseFnBody() {
			if (this.is("punct", "{")) return this.parseStmt();
			return this.parsePipe();
		}
		tryParseFnParamsUntilCloseParen() {
			const startPos = this.pos;
			const params = [];
			const defaults = [];
			if (this.eat("punct", ")")) return {
				params,
				defaults
			};
			while (!this.is("eof")) {
				this.tick();
				const paramStart = this.at();
				if (this.is("punct", "[")) {
					this.pos++;
					const names = [];
					while (!this.is("eof") && !this.is("punct", "]")) {
						if (!this.is("identifier") && !(this.is("keyword") && this.at().value === "in")) {
							this.pos = startPos;
							return null;
						}
						names.push(String(this.at().value));
						this.pos++;
						if (!this.eat("punct", ",")) break;
					}
					if (!this.eat("punct", "]")) {
						this.pos = startPos;
						return null;
					}
					const param = {
						type: "param-destructure",
						names,
						loc: this.locFrom(paramStart, this.prev())
					};
					params.push(param);
				} else if (this.is("identifier") || this.is("keyword") && this.at().value === "in") {
					const name = String(this.at().value);
					this.pos++;
					if (this.eat("punct", ":") && this.is("punct", "[")) {
						this.pos++;
						const names = [];
						while (!this.is("eof") && !this.is("punct", "]")) {
							if (!this.is("identifier") && !(this.is("keyword") && this.at().value === "in")) {
								this.pos = startPos;
								return null;
							}
							names.push(String(this.at().value));
							this.pos++;
							if (!this.eat("punct", ",")) break;
						}
						if (!this.eat("punct", "]")) {
							this.pos = startPos;
							return null;
						}
						const param = {
							type: "param-named-destructure",
							paramName: name,
							names,
							loc: this.locFrom(paramStart, this.prev())
						};
						params.push(param);
					} else {
						const param = {
							type: "param",
							name,
							loc: this.locFrom(paramStart, this.prev())
						};
						params.push(param);
					}
				} else {
					this.pos = startPos;
					return null;
				}
				let def = null;
				if (this.eat("operator", "=")) {
					if (!this.is("punct", ",") && !this.is("punct", ")")) {
						const errLen = this.errors.length;
						const before = this.pos;
						try {
							def = this.parseExpr();
						} catch {
							this.errors.length = errLen;
							this.pos = startPos;
							return null;
						}
						if (this.pos === before) {
							this.errors.length = errLen;
							this.pos = startPos;
							return null;
						}
						this.errors.length = errLen;
					}
				}
				defaults.push(def);
				if (this.eat("punct", ",")) {
					if (this.eat("punct", ")")) return {
						params,
						defaults
					};
					continue;
				}
				if (this.eat("punct", ")")) return {
					params,
					defaults
				};
				this.pos = startPos;
				return null;
			}
			this.pos = startPos;
			return null;
		}
		tokenFromLoc(loc) {
			return {
				...this.at(),
				start: loc.start,
				end: loc.end,
				line: loc.line,
				column: loc.column
			};
		}
	};
	const CONTROL_PRELUDE_SRC = `\
/**
 * control prelude
 */

mix => $
bpm = 120
transpose = 0
tune = 1
scale = 'major'
o0=2 o1=4 o2=8 o3=16 o4=32 o5=64 o6=128 o7=256 o8=512 o9=1024 o10=2048 o11=4096

/**
 * array
 */

map=(array,fn)->{
  newArray:=[]
  for (el of array) newArray.push(fn(el))
  newArray
}

avg=array->{
  sum=0
  for (el of array) sum += el
  sum/array.length
}

shuffle=(array,seed=0)->{
  copy:=[]
  for (el of array) copy.push(el)
  n:=copy.length
  for (k in 0 .. n - 2) {
    i:=n-1-k
    r:=fract(seed*12.9898+i*78.233+k*45.17)
    j:=floor(r*(i+1))
    tmp:=copy[i]
    copy[i]=copy[j]
    copy[j]=tmp
  }
  copy
}

reverse=array->{
  copy:=[]
  n:=array.length
  for (i in 0 .. n - 1) copy.push(array[n-1-i])
  copy
}

/**
 * effects
 */

delay=(in,seconds=0.5,feedback=0,cb=x->x,size=1)->{
  buf=alloc(size)
  sample=read(buf,seconds)
  write(cb(in+sample*feedback),buf)
  sample
}

tube=(in,drive=3,bias=.2)->{
  tanh((in+bias)*drive)-tanh(bias*drive)
}

// Modulated delay effect with LFO-controlled delay time
moddelay=(in,base,depth,rate,feedback,offset=0)->{
  lfo = lfotri(rate, offset)
  seconds = base + depth * lfo
  delay(in, seconds, feedback)
}

// Classic flanger effect (modulated comb filter)
flanger=(in,rate=1,depth=0.00125,base=0.00125,feedback=0.7)->{
  moddelay(in, base, depth, rate, feedback)
}

// Multi-voice chorus effect with spread and modulation
chorus=(in,voices=3,base=0.02,depth=0.006,rate=0.25,spread=.5)->{
  sum = 0
  voices = max(voices,1)

  for (i in 0 .. voices - 1) {
    phase = (i / voices) * spread
    sum += moddelay(
      in,
      base,
      depth,
      rate,
      feedback:0,
      phase
    )
  }

  sum / voices
}

/**
 * utilities
 */

print = value -> { emit(value); value }

// Compile-time only: label(bar, text, color?) for timeline header/minimap visualization. bar is 1-based, color 0-5.
label = (bar, text, color=1) -> 0

midiToHz = midi -> {
  m := midi + transpose
  emit(m)
  440 * 2 ** ((m - 69) / 12) * tune
}

play=(x,cb,voices=1)->{
  sum=0
  for (i in 0 .. voices - 1) {
    [hz,vel,trig]=isarray(x) && isarray(x[i]) ? x[i] : [0,0,0]
    sum+=cb(hold(hz),vel,trig)
  }
  sum/voices
}

dec=(hz=1,floor=0,offset=1,trig)->1-inc(hz,1-floor,1-offset,trig)

buses=[[0,0],[0,0],[0,0],[0,0],[0,0]]

bus=(index,in)->{
  if (isundefined(in)) return buses[index]
  else if (isarray(in)) {
    buses[index][0]+=in[0]
    buses[index][1]+=in[1]
    analyser(in[0])
    return buses[index]
  }
  else {
    buses[index]+=analyser(in)
    return buses[index]
  }
}

buss=(index,in)->solo(in)

// Convert decibels to linear gain multiplier (10^(dB/20))
db=x->10**(x/20)

// Convert bipolar signal to unipolar ([-1,1] to [0,1])
uni=x->x*.5+.5

// Convert unipolar signal to bipolar ([-1,1] to [0,1])
bi=x->x*2-1

// Crossfade between two signals
crossfade=(a,b,t)->lerp(a,b,clamp(t,0,1))

// Convert semitones to frequency multiplier (2^(semitones/12))
semis=x->2**(x/12)

// Convert mono signal to stereo, optionally with delay-based widening
stereo=(in,width=0)->[in,delay(in,seconds:width)]

// Convert stereo signal to mono by averaging channels
mono=([L,R])->(L+R)*.5

// Adjust stereo width using mid-side processing (1 = normal, 0 = mono, >1 = wider)
stereowidth=([L,R],width=1)->{
  mid=(L+R)*0.5
  side=(L-R)*0.5
  side*=width
  return [mid+side,mid-side]
}

// Widen stereo signal by delaying high frequencies in right channel
widen=([L,R],seconds=0.0001)->{
  cutoff=200
  loL=lp(L,cutoff)
  loR=lp(R,cutoff)
  hiL=hp(L,cutoff)
  hiR=hp(R,cutoff)
  return [loL+hiL,loR+delay(hiR,seconds)]
}

// Pan stereo signal (0=left, 0.5=center, 1=right)
pan=([L,R],balance=0.5)->{
  p=clamp(balance,0,1)
  return [L*(1-p),R*p]
}

/**
 * aliases
 */
ntof = midiToHz
mtof = midiToHz
outs = solo
sout = solo

/**
 * synths
 */

// Karplus-Strong plucked string synthesis
karplus=(hz,pluck=pink,seed=1854,attack=.0001,decay=.1,exponent=50,damping=.5,trig)->{
  exc := pluck(seed, trig) * ad(attack,decay,exponent,trig)
  delayTime := safediv(1, hz)
  dampingCutoff := hz*((1-damping)*30)
  oversample(8, () -> delay(exc,delayTime,1,x -> tanh(lp1(x, dampingCutoff))))
}

rhodes=(hz,vel=1,trig)->{
  v = clamp(vel,0,1)

  // Tine FM (velocity controls metallic bite)
  fmIndex = hz * (.2 + 2.8*v)
  fm = sine(hz*2.01) * fmIndex
  tine = sine(hz + fm, 0, trig)

  // Dual tone-bar resonances (slightly inharmonic)
  resonances = [
    bp(tine, hz*3.8, 7),
    bp(tine, hz*7.1, 9)
  ].avg()

  // Pickup / hammer click
  click = hp(tine, 2500, 0.7)
        * ad(.0004,.025,14,trig)
        * (.3 + .7*v)

  // Raw mix
  s = tine*.55 + resonances*.9 + click*.35

  // Envelope + velocity scaling
  s *= (.15 + .85*v)

  // Gentle saturation + DC cleanup
  s = tube(s, drive:2.0 + v, bias:.04)

  // Pickup EQ tilt (brighter with velocity)
  s = ls(s, 250, -2*(1-v))
    + hs(s, 3200, 3*v)

  // Classic Rhodes chorus
  s = chorus(s, voices:5, rate:.13, depth:.008, spread:.2)

  s*.5
}

rhodes70=(hz,vel=1,trig)->{
  v = clamp(vel,0,1)

  // Fundamental (very pure)
  core = sine(hz, trig)

  // Hammer / tine attack (noise, not FM)
  hammer =
    bp(pink(1234,trig), hz*2.5, 6)
    * ad(.0006,.04,10,trig)
    * (.25 + .6*v)

  // Tone-bar resonances (dominant character)
  resonances = [
    bp(core, hz*3.2, 8),
    bp(core, hz*6.4, 10)
  ].avg()

  // Slight beating via slow detune (control-rate, not audio-rate)
  det = 1 + (.002 + .004*v) * lfosine(.6)
  body = sine(hz*det) * .3

  // Mix (bars > fundamental)
  s =
    core*.35 +
    resonances*1.0 +
    body +
    hammer

  // Apply envelope + velocity
  s *= (.2 + .8*v)

  // Very gentle saturation (mostly for compression feel)
  s = tanh(s * (1.2 + .8*v))

  // Pickup EQ: dark, rounded top
  s = ls(s, 220, -1.5)
    |> hs($, 2800, 1.2*v)

  // Subtle chorus (slow + shallow)
  s = chorus(s, voices:2, rate:.15, depth:.003, spread:.4)

  s
}

// Supersaw oscillator with detuned voices
supersaw=(hz,voices=5,spread=.05)->{
  s = 0
  for (i in 0 .. voices) {
    d = (i/(voices+1)-.5)*spread
    s += saw(hz*(1+d))
  }
  s / voices
}

bdsynth=(
  base=#1*o2,
  punch=25000k,
  offset=0.0006,
  cutoff=5k,
  q=.25,
  amp=trig->ad(.0001,.5,40,trig),
  fm=trig->ad(.00008,.013,900,trig),
  filter=trig->ad(.000147,.25,50.000,trig),
  trig=tram('x-x-x-x-'),
)->sine(base+punch*fm(trig),offset,trig)*amp(trig) |> lps($,base+cutoff*filter(trig),q) |> limiter($)

bd=(base,punch,offset,cutoff,q,amp,fm,filter,trig=tram('x-x-x-x-'))->{
  sample=record(.2,()->bdsynth(base,punch,offset,cutoff,q,amp,fm,filter,trig:1))
  sampler(sample,trig)
}

hhsynth=(width=.4,trig)->{
  env=adsr(.06,.05 ,.950 ,.1 ,32,trig)
  oversample(8,()->[205.3,369.6,304.4,522.7,800,540].map(x->pwm(x,width)).avg()*env
  |> bp($,8000,.85)|>bp($,10k,.85)|>hp($,11k,.85)) |> tanh($*6)
}

ch=(width=.9,trig=tram('--x-',1/4))->{
  sample=record(.2,()->hhsynth(width,trig:step(.9,dec())))
  sampler(sample,trig,offset:.29)*ad(0.0001,.5,3,trig)*.6
}

oh=(width=.4,trig=tram('-x',1/4))->{
  sample=record(.2,()->hhsynth(width,trig:step(.9,dec())))
  sampler(sample,trig,offset:.299)*ad(0.0001,.9,trig)*.8
}

sdsynth=(seed=7,base=#5*o2,trig=step(.9,dec()))->{
  amp=ad(.0001,1.7366,20,trig)
  noise=adsr(.0001,.0231 ,.870 ,.3159 ,8.000,trig)
  click = ad(.0001, .02, 4, trig)
  pitch = ad(.0001, .3095 , 20, trig)
  pitchAmt=base*2
  ;(sine(base+pitch*pitchAmt,trig)*.3 |> bps($, base * 2, .8))*amp

  +(white(seed,trig) |> hps($, 1800,.4) |> bps($, 7100, .4))*noise
  +(white(8,trig) |> hps($, 4000,.6))*click
  |> tube($,2,.01)*.3
}

sd=(seed,trig=tram('-x',1/2))->{
  sample=record(.2,()->sdsynth(seed))
  sampler(sample,trig)
}

drums=(seed=1)->{
  chw = fract(seed * 1234.1234)
  ohw = fract(seed * 4567.4567)
  bd()+sd(seed)+ch(chw)+oh(ohw) |> limiter($)
}

;
`;
	const CONTROL_PRELUDE_SEPARATOR = "\n";
	function getControlPreludeText() {
		const preludeText = (CONTROL_PRELUDE_SRC.endsWith("\n") ? CONTROL_PRELUDE_SRC : CONTROL_PRELUDE_SRC + "\n") + CONTROL_PRELUDE_SEPARATOR;
		return {
			preludeText,
			preludeLen: preludeText.length,
			preludeLines: preludeText.split("\n").length - 1
		};
	}
	const KEYWORDS = new Set([
		"if",
		"else",
		"for",
		"while",
		"do",
		"break",
		"continue",
		"return",
		"switch",
		"case",
		"default",
		"try",
		"catch",
		"finally",
		"throw",
		"true",
		"false",
		"null",
		"in",
		"of"
	]);
	const OPS = [
		">>>",
		">>=",
		"<<=",
		"**=",
		"&=",
		"|=",
		"^=",
		"=>",
		"..",
		"==",
		"!=",
		"<=",
		">=",
		"&&",
		"||",
		"|>",
		"->",
		":=",
		"<<",
		">>",
		"**",
		"+=",
		"-=",
		"*=",
		"/=",
		"%="
	];
	const SINGLE_OPS = new Set([
		"=",
		"<",
		">",
		"+",
		"-",
		"*",
		"/",
		"%",
		"!",
		"&",
		"|",
		"^",
		"~"
	]);
	const PUNCT = new Set([
		"(",
		")",
		"{",
		"}",
		"[",
		"]",
		",",
		";",
		":",
		".",
		"?"
	]);
	function tokenize(input) {
		const tokens = [];
		const errors = [];
		let i$1 = 0;
		let line = 1;
		let column = 1;
		let guard = 0;
		const guardMax = input.length * 4 + 1024;
		const push = (type, value, start, end, l$1, c$1, stringDelimiter) => {
			tokens.push({
				type,
				value,
				start,
				end,
				line: l$1,
				column: c$1,
				stringDelimiter
			});
		};
		const err = (message, start, end, l$1, c$1) => {
			errors.push({
				message,
				loc: {
					start,
					end,
					line: l$1,
					column: c$1
				},
				code: input.slice(start, Math.min(input.length, start + 80))
			});
		};
		const isWs = (ch) => ch === " " || ch === "	" || ch === "\r" || ch === "\n";
		const isDigit = (ch) => ch >= "0" && ch <= "9";
		const isIdentStart = (ch) => ch >= "a" && ch <= "z" || ch >= "A" && ch <= "Z" || ch === "_" || ch === "$";
		const isIdent = (ch) => isIdentStart(ch) || isDigit(ch);
		const advance = (n$1 = 1) => {
			while (n$1-- > 0) {
				const ch = input[i$1];
				i$1++;
				if (ch === "\n") {
					line++;
					column = 1;
				} else column++;
			}
		};
		const matchOp = () => {
			for (const op of OPS) if (input.startsWith(op, i$1)) return op;
			return null;
		};
		while (i$1 < input.length) {
			guard++;
			if (guard > guardMax) {
				err("Lexer exceeded max steps (possible infinite loop)", i$1, i$1 + 1, line, column);
				break;
			}
			const ch = input[i$1];
			if (isWs(ch)) {
				advance(1);
				continue;
			}
			if (ch === "/" && input[i$1 + 1] === "/") {
				advance(2);
				while (i$1 < input.length && input[i$1] !== "\n") advance(1);
				continue;
			}
			if (ch === "/" && input[i$1 + 1] === "*") {
				const start = i$1;
				const l$1 = line;
				const c$1 = column;
				advance(2);
				let closed = false;
				while (i$1 < input.length) {
					if (input[i$1] === "*" && input[i$1 + 1] === "/") {
						advance(2);
						closed = true;
						break;
					}
					advance(1);
				}
				if (!closed) err("Unclosed block comment", start, i$1, l$1, c$1);
				continue;
			}
			const op = matchOp();
			if (op) {
				const start = i$1;
				const l$1 = line;
				const c$1 = column;
				advance(op.length);
				push("operator", op, start, i$1, l$1, c$1);
				continue;
			}
			const lastTok = tokens[tokens.length - 1];
			const prefixCtx = !lastTok || lastTok.type === "punct" && "([,?:".includes(String(lastTok.value)) || lastTok.type === "operator" && lastTok.value === "=";
			const next = input[i$1 + 1];
			if (prefixCtx && (ch === "-" || ch === "+") && (isDigit(next ?? "") || next === "." && isDigit(input[i$1 + 2] ?? ""))) {
				const start = i$1;
				const l$1 = line;
				const c$1 = column;
				const sign = ch === "-" ? -1 : 1;
				advance(1);
				const numStart = i$1;
				let hasDot = false;
				while (i$1 < input.length) {
					const cur = input[i$1];
					if (isDigit(cur)) {
						advance(1);
						continue;
					}
					if (cur === "." && !hasDot) {
						if (input[i$1 + 1] === ".") break;
						hasDot = true;
						advance(1);
						continue;
					}
					if ((cur === "e" || cur === "E") && (isDigit(input[i$1 + 1] ?? "") || ["+", "-"].includes(input[i$1 + 1] ?? ""))) {
						advance(1);
						if (input[i$1] === "+" || input[i$1] === "-") advance(1);
						while (isDigit(input[i$1] ?? "")) advance(1);
						continue;
					}
					break;
				}
				const rawEnd = i$1;
				let mult = 1;
				if (input[i$1] === "k") {
					mult = 1e3;
					advance(1);
				}
				const raw = input.slice(numStart, rawEnd);
				const n$1 = Number(raw) * mult * sign;
				if (!Number.isFinite(n$1)) err("Invalid number literal", start, i$1, l$1, c$1);
				push("number", n$1, start, i$1, l$1, c$1);
				continue;
			}
			if (SINGLE_OPS.has(ch)) {
				const start = i$1;
				const l$1 = line;
				const c$1 = column;
				advance(1);
				push("operator", ch, start, i$1, l$1, c$1);
				continue;
			}
			if (PUNCT.has(ch) && !(ch === "." && isDigit(input[i$1 + 1] ?? ""))) {
				const start = i$1;
				const l$1 = line;
				const c$1 = column;
				advance(1);
				push("punct", ch, start, i$1, l$1, c$1);
				continue;
			}
			if (ch === "\"" || ch === "'" || ch === "`") {
				const quote = ch;
				let delimiter;
				if (ch === "'") delimiter = "single";
				else if (ch === "\"") delimiter = "double";
				else delimiter = "backtick";
				const start = i$1;
				const l$1 = line;
				const c$1 = column;
				advance(1);
				let content = "";
				let closed = false;
				while (i$1 < input.length) {
					const cur = input[i$1];
					if (cur === quote) {
						advance(1);
						closed = true;
						break;
					}
					content += cur;
					advance(1);
				}
				if (!closed) err("Unclosed string literal", start, i$1, l$1, c$1);
				push("string", content, start, i$1, l$1, c$1, delimiter);
				continue;
			}
			if (isDigit(ch) || ch === "." && isDigit(input[i$1 + 1] ?? "")) {
				const start = i$1;
				const l$1 = line;
				const c$1 = column;
				let hasDot = false;
				while (i$1 < input.length) {
					const cur = input[i$1];
					if (isDigit(cur)) {
						advance(1);
						continue;
					}
					if (cur === "." && !hasDot) {
						if (input[i$1 + 1] === ".") break;
						hasDot = true;
						advance(1);
						continue;
					}
					if ((cur === "e" || cur === "E") && (isDigit(input[i$1 + 1] ?? "") || ["+", "-"].includes(input[i$1 + 1] ?? ""))) {
						advance(1);
						if (input[i$1] === "+" || input[i$1] === "-") advance(1);
						while (isDigit(input[i$1] ?? "")) advance(1);
						continue;
					}
					break;
				}
				const rawEnd = i$1;
				let mult = 1;
				if (input[i$1] === "k") {
					mult = 1e3;
					advance(1);
				}
				const raw = input.slice(start, rawEnd);
				const n$1 = Number(raw) * mult;
				if (!Number.isFinite(n$1)) err("Invalid number literal", start, i$1, l$1, c$1);
				push("number", n$1, start, i$1, l$1, c$1);
				continue;
			}
			if (ch === "#") {
				const start = i$1;
				const l$1 = line;
				const c$1 = column;
				advance(1);
				while (i$1 < input.length && isIdent(input[i$1] ?? "")) advance(1);
				push("identifier", "#" + input.slice(start + 1, i$1), start, i$1, l$1, c$1);
				continue;
			}
			const isNoteLetter = (c$1) => /^[a-gA-G]$/.test(c$1);
			if (isNoteLetter(ch)) {
				const noteMatch = input.slice(i$1).match(/^[a-gA-G]([#b])?(-?\d+)/);
				if (noteMatch) {
					const start = i$1;
					const l$1 = line;
					const c$1 = column;
					advance(noteMatch[0].length);
					push("identifier", noteMatch[0], start, i$1, l$1, c$1);
					continue;
				}
			}
			if (isIdentStart(ch)) {
				const start = i$1;
				const l$1 = line;
				const c$1 = column;
				while (i$1 < input.length && isIdent(input[i$1] ?? "")) advance(1);
				const s$1 = input.slice(start, i$1);
				if (KEYWORDS.has(s$1)) push("keyword", s$1, start, i$1, l$1, c$1);
				else push("identifier", s$1, start, i$1, l$1, c$1);
				continue;
			}
			{
				const start = i$1;
				const l$1 = line;
				const c$1 = column;
				advance(1);
				err(`Unexpected character "${ch}"`, start, i$1, l$1, c$1);
			}
		}
		push("eof", null, i$1, i$1, line, column);
		return {
			tokens,
			errors
		};
	}
	function shiftUserTokens(tokens, preludeLen, preludeLines) {
		const out = [];
		for (const t$1 of tokens) {
			if (t$1.type === "eof") continue;
			out.push({
				...t$1,
				start: t$1.start + preludeLen,
				end: t$1.end + preludeLen,
				line: t$1.line + preludeLines
			});
		}
		return out;
	}
	function createControlPipeline(preludeSrc) {
		const { preludeText, preludeLen, preludeLines } = getControlPreludeText();
		const preludeLex = tokenize(preludeText);
		if (preludeLex.errors.length) throw new Error(`Control prelude lex failed:\n${preludeLex.errors.map((e$1) => `${e$1.loc.line}:${e$1.loc.column} ${e$1.message}`).join("\n")}`);
		const preludeTokens = preludeLex.tokens.filter((t$1) => t$1.type !== "eof");
		function lex(src) {
			const userLex = tokenize(src);
			const shiftedUserTokens = shiftUserTokens(userLex.tokens, preludeLen, preludeLines);
			const eof = userLex.tokens[userLex.tokens.length - 1];
			const shiftedEof = {
				...eof,
				start: eof.start + preludeLen,
				end: eof.end + preludeLen,
				line: eof.line + preludeLines
			};
			return {
				preludeText,
				preludeLen,
				preludeLines,
				preludeTokens,
				userTokens: userLex.tokens,
				tokens: [
					...preludeTokens,
					...shiftedUserTokens,
					shiftedEof
				],
				errors: userLex.errors
			};
		}
		function parse(src, existingLex) {
			const l$1 = existingLex ?? lex(src);
			const fullSrc = preludeText + src;
			const parsed = parseTokens(fullSrc, l$1.tokens);
			const parseErrors = parsed.errors.map((e$1) => e$1.loc.line > preludeLines ? {
				...e$1,
				loc: {
					...e$1.loc,
					line: e$1.loc.line - preludeLines
				}
			} : e$1);
			const errors = [...l$1.errors.map((e$1) => ({
				message: e$1.message,
				loc: e$1.loc,
				code: e$1.code
			})), ...parseErrors];
			const program = errors.length ? null : parsed.program;
			return {
				src,
				fullSrc,
				preludeLen,
				preludeLines,
				program,
				errors,
				numberLiterals: program ? collectNumberLiterals(program).filter((n$1) => n$1.loc.line > preludeLines) : []
			};
		}
		function compileProgram(program, opts) {
			return compile(program, preludeLines, opts);
		}
		function compileSource(src, opts) {
			const l$1 = lex(src);
			const p$1 = parse(src, l$1);
			if (p$1.errors.length > 0 || !p$1.program) {
				const formattedErrors$1 = [];
				for (const e$1 of l$1.errors) formattedErrors$1.push(`Lex ${e$1.loc.line}:${e$1.loc.column} ${e$1.message}`);
				for (const e$1 of p$1.errors) formattedErrors$1.push(`Parse ${e$1.loc.line}:${e$1.loc.column} ${e$1.message}`);
				return {
					lex: l$1,
					parse: p$1,
					compile: {
						bytecode: null,
						errors: [],
						sampleRegistrations: [],
						functionCalls: [],
						bpm: 120,
						labels: []
					},
					errors: formattedErrors$1
				};
			}
			const c0 = compileProgram(p$1.program, opts);
			const errors = c0.errors.map((e$1) => e$1.loc.line > p$1.preludeLines ? {
				...e$1,
				loc: {
					...e$1.loc,
					line: e$1.loc.line - p$1.preludeLines
				}
			} : e$1);
			const c$1 = {
				...c0,
				errors
			};
			const formattedErrors = [];
			for (const e$1 of l$1.errors) formattedErrors.push(`Lex ${e$1.loc.line}:${e$1.loc.column} ${e$1.message}`);
			for (const e$1 of p$1.errors) formattedErrors.push(`Parse ${e$1.loc.line}:${e$1.loc.column} ${e$1.message}`);
			for (const e$1 of c$1.errors) formattedErrors.push(`Compile ${e$1.loc.line}:${e$1.loc.column} ${e$1.message}`);
			return {
				lex: l$1,
				parse: p$1,
				compile: c$1,
				errors: formattedErrors
			};
		}
		return {
			lex,
			parse,
			compile: compileProgram,
			compileSource
		};
	}
	const controlPipeline = createControlPipeline();
	const allocations = /* @__PURE__ */ new Map();
	function track(id, category, bytes, meta) {
		const source = meta?.source ?? "unknown";
		allocations.set(id, {
			id,
			category,
			bytes,
			meta: {
				...meta,
				source
			},
			at: Date.now()
		});
	}
	function untrack(id) {
		allocations.delete(id);
	}
	const HISTORY_META_SHARED_HEADER = 2;
	(HISTORY_META_SHARED_HEADER + 512 * HISTORY_META_STRIDE) * 4;
	function historyMetaMetaOffset(index) {
		return HISTORY_META_SHARED_HEADER + index * HISTORY_META_STRIDE;
	}
	function createStaleMetaFacade() {
		const m$1 = new Uint32Array(HISTORY_META_STRIDE);
		m$1[12] = 4294967295;
		return m$1;
	}
	var AudioVmHistoryView = class AudioVmHistoryView {
		memory;
		metaOffset;
		infoPtr;
		metaSlice = null;
		constructor(memory, metaOffset, infoPtr, metaSlice) {
			this.memory = memory;
			this.metaOffset = metaOffset;
			this.infoPtr = infoPtr;
			this.metaSlice = metaSlice ?? null;
		}
		get meta() {
			if (this.metaSlice) return this.metaSlice;
			const info = new Uint32Array(this.memory.buffer, this.infoPtr, AUDIO_VM_INFO_STRIDE);
			const historyCount = info[6];
			if (this.metaOffset / HISTORY_META_STRIDE >= historyCount) {
				this.metaSlice = createStaleMetaFacade();
				return this.metaSlice;
			}
			const historyMetaPtr = info[5];
			return new Uint32Array(this.memory.buffer, historyMetaPtr + this.metaOffset * 4, HISTORY_META_STRIDE);
		}
		static fromMeta(memory, historyIndex, metaU32, metaBaseOffset) {
			const slice = new Uint32Array(metaU32.buffer, metaU32.byteOffset + metaBaseOffset * 4, HISTORY_META_STRIDE);
			return new AudioVmHistoryView(memory, historyIndex * HISTORY_META_STRIDE, 0, slice);
		}
		get spec() {
			return genSpecs[this.meta[0]];
		}
		get id() {
			return this.meta[0];
		}
		get historyIndex() {
			return this.metaOffset / HISTORY_META_STRIDE;
		}
		get genName() {
			return this.spec.genName;
		}
		get variantName() {
			return this.spec.variantName;
		}
		get className() {
			return this.spec.className;
		}
		get paramNames() {
			return this.spec.paramNames;
		}
		get paramModes() {
			return this.spec.paramModes;
		}
		get emitNames() {
			return this.spec.emitNames;
		}
		get paramCount() {
			return this.meta[1];
		}
		get size() {
			return this.meta[2];
		}
		get writeIndex() {
			return this.meta[3];
		}
		get sampleCounts() {
			const m$1 = this.meta;
			return new Int32Array(this.memory.buffer, m$1[4], m$1[2]);
		}
		get values() {
			const m$1 = this.meta;
			return new Float32Array(this.memory.buffer, m$1[5], m$1[2] * m$1[1]);
		}
		get inputPtr() {
			return this.meta[6];
		}
		get inputChunkPos() {
			return this.meta[7];
		}
		get outputPtr() {
			return this.meta[8];
		}
		get outputChunkPos() {
			return this.meta[9];
		}
		get chunkSamples() {
			return this.meta[10];
		}
		get ringChunks() {
			return this.meta[11];
		}
		get callStackFrames() {
			const frames = [];
			const m$1 = this.meta;
			for (let i$1 = 0; i$1 < 8; i$1++) {
				const frame = m$1[12 + i$1];
				if (frame === 4294967295) break;
				frames.push(frame);
			}
			return frames;
		}
		getInputBuffer(bufferLength) {
			const ptr = this.meta[6];
			if (ptr === 0) return null;
			return new Float32Array(this.memory.buffer, ptr, bufferLength);
		}
		getOutputBuffer(bufferLength) {
			const ptr = this.meta[8];
			if (ptr === 0) return null;
			return new Float32Array(this.memory.buffer, ptr, bufferLength);
		}
		getInputRingView() {
			const ptr = this.meta[6];
			if (ptr === 0) return null;
			const chunkSamples = this.meta[10];
			const ringChunks = this.meta[11];
			return new Float32Array(this.memory.buffer, ptr, chunkSamples * ringChunks);
		}
		_outputRingView = null;
		getOutputRingView() {
			const ptr = this.meta[8];
			if (ptr === 0) return null;
			const chunkSamples = this.meta[10];
			const ringChunks = this.meta[11];
			if (!this._outputRingView || this._outputRingView.buffer !== this.memory.buffer) this._outputRingView = new Float32Array(this.memory.buffer, ptr, chunkSamples * ringChunks);
			return this._outputRingView;
		}
	};
	var AudioVmView = class {
		memory;
		infoPtr;
		constructor(memory, infoPtr) {
			if (!memory || !memory.buffer) throw new Error("Invalid memory: memory or memory.buffer is undefined");
			this.memory = memory;
			this.infoPtr = infoPtr;
		}
		get info() {
			return new Uint32Array(this.memory.buffer, this.infoPtr, AUDIO_VM_INFO_STRIDE);
		}
		get stackTop() {
			return this.info[3];
		}
		get stack() {
			const i$1 = this.info;
			return new Float64Array(this.memory.buffer, i$1[0], i$1[4]);
		}
		get histories() {
			const historyCount = this.info[6];
			return Array.from({ length: historyCount }, (_$1, i$1) => new AudioVmHistoryView(this.memory, i$1 * HISTORY_META_STRIDE, this.infoPtr));
		}
		static fromHistoryMetaShared(memory, historyMetaU32) {
			const historyCount = historyMetaU32[1] ?? 0;
			const views = [];
			for (let i$1 = 0; i$1 < historyCount; i$1++) {
				const baseOffset = historyMetaMetaOffset(i$1);
				views.push(AudioVmHistoryView.fromMeta(memory, i$1, historyMetaU32, baseOffset));
			}
			return { histories: views };
		}
	};
	function createTypedParamAccessor(getValues, getWriteIndex, paramIndex, paramCount, size) {
		return new Proxy({
			get latest() {
				const values = getValues();
				const writeIndex = getWriteIndex();
				return values[(writeIndex > 0 ? (writeIndex - 1) % size : size - 1) * paramCount + paramIndex] ?? 0;
			},
			at(index) {
				return getValues()[index * paramCount + paramIndex] ?? 0;
			}
		}, { get(target, prop) {
			if (typeof prop === "string" && /^\d+$/.test(prop)) {
				const index = parseInt(prop, 10);
				return getValues()[index * paramCount + paramIndex] ?? 0;
			}
			return Reflect.get(target, prop);
		} });
	}
	function createTypedSampleCountsAccessor(getSampleCounts, getWriteIndex, size) {
		const arr = getSampleCounts();
		Object.defineProperty(arr, "latest", {
			get() {
				const sampleCounts = getSampleCounts();
				const writeIndex = getWriteIndex();
				return sampleCounts[writeIndex > 0 ? (writeIndex - 1) % size : size - 1] ?? 0;
			},
			enumerable: true
		});
		return arr;
	}
	function createTypedHistory(history, source) {
		const size = history.size;
		const mask = size - 1;
		const paramCount = history.paramCount;
		const paramNames = history.paramNames;
		const emitNames = history.emitNames || [];
		const getWriteIndex = () => history.writeIndex;
		const getValues = () => history.values;
		const getSampleCounts = () => history.sampleCounts;
		const sampleCounts = createTypedSampleCountsAccessor(getSampleCounts, getWriteIndex, size);
		const params = {};
		for (let i$1 = 0; i$1 < paramNames.length; i$1++) params[paramNames[i$1]] = createTypedParamAccessor(getValues, getWriteIndex, i$1, paramCount, size);
		const emit = {};
		if (emitNames.length > 0) for (let i$1 = 0; i$1 < emitNames.length; i$1++) {
			const emitIndex = paramNames.length + i$1;
			emit[emitNames[i$1]] = createTypedParamAccessor(getValues, getWriteIndex, emitIndex, paramCount, size);
		}
		return {
			id: history.id,
			genName: history.genName,
			variantName: history.variantName,
			className: history.className,
			source,
			view: history,
			index: history.historyIndex,
			params,
			emit,
			size,
			mask,
			get writeIndex() {
				return getWriteIndex();
			},
			get values() {
				return getValues();
			},
			sampleCounts
		};
	}
	function createTypedHistories(histories, sourceMap) {
		const framesByHistory = /* @__PURE__ */ new WeakMap();
		const getFrames = (h$1) => {
			const cached = framesByHistory.get(h$1);
			if (cached) return cached;
			const frames = h$1.callStackFrames;
			framesByHistory.set(h$1, frames);
			return frames;
		};
		const sourceMapByPc = /* @__PURE__ */ new Map();
		const callSiteByPc = /* @__PURE__ */ new Map();
		const callSiteEntries = [];
		for (const entry of sourceMap) {
			const arr = sourceMapByPc.get(entry.pc);
			if (arr) arr.push(entry);
			else sourceMapByPc.set(entry.pc, [entry]);
			if (entry.callSite && entry.funcName) {
				const e$1 = entry;
				callSiteByPc.set(entry.pc, e$1);
				callSiteEntries.push(e$1);
			}
		}
		const matches = [];
		const outSoloMatch = (eGen, hGen) => eGen === hGen || eGen === "Solo" && hGen === "Out" || eGen === "Out" && hGen === "Solo";
		for (const history of histories) {
			const frames = getFrames(history);
			for (const pc of frames) {
				const sm = sourceMapByPc.get(pc)?.find((e$1) => !e$1.callSite && outSoloMatch(e$1.genName, history.genName));
				if (sm) {
					matches.push({
						history,
						sourceMap: sm
					});
					break;
				}
			}
		}
		const matchedHistoryViews = new Set(matches.map((m$1) => m$1.history));
		const typedHistories = matches.map(({ history, sourceMap: sourceMap$1 }) => {
			const typedHistory = createTypedHistory(history, {
				line: sourceMap$1.line,
				column: sourceMap$1.column
			});
			if (sourceMap$1.genName === "Out" || sourceMap$1.genName === "Solo") typedHistory.genName = sourceMap$1.genName;
			if (typedHistory.genName === "Tram") {
				if (sourceMap$1.tramBeatMapping === void 0) throw new Error("Tram history source map entry missing tramBeatMapping");
				typedHistory.beatMapping = sourceMap$1.tramBeatMapping;
			}
			if (typedHistory.genName === "Mini") {
				if (sourceMap$1.sequence === void 0 || sourceMap$1.compileResult === void 0) throw new Error("Mini history source map entry missing sequence or compileResult");
				typedHistory.sequence = sourceMap$1.sequence;
				typedHistory.compileResult = sourceMap$1.compileResult;
			}
			if (typedHistory.genName === "Timeline") {
				if (sourceMap$1.sequence === void 0) throw new Error("Timeline history source map entry missing sequence");
				typedHistory.sequence = sourceMap$1.sequence;
				typedHistory.segmentTokens = sourceMap$1.timelineSegmentTokens ?? [];
				if (sourceMap$1.timelineColorIndex !== void 0) typedHistory.colorIndex = sourceMap$1.timelineColorIndex;
			}
			if (typedHistory.genName === "ArrayGet" && sourceMap$1.arrayGetElementMapping !== void 0) typedHistory.elementMapping = sourceMap$1.arrayGetElementMapping;
			const frames = getFrames(history);
			const genPc = sourceMap$1.pc;
			for (const pc of frames) if (pc !== genPc) {
				const callSm = callSiteByPc.get(pc);
				if (callSm?.funcName) {
					typedHistory.callSiteSource = {
						line: callSm.line,
						column: callSm.column,
						funcName: callSm.funcName
					};
					break;
				}
			}
			return typedHistory;
		});
		const innerOnlyByCallSitePc = /* @__PURE__ */ new Map();
		for (const history of histories) {
			if (matchedHistoryViews.has(history)) continue;
			const frames = getFrames(history);
			if (frames.length === 0 || frames[0] === 4294967295) continue;
			for (const pc of frames) {
				const callSm = callSiteByPc.get(pc);
				if (callSm?.funcName) {
					const typed = createTypedHistory(history, {
						line: callSm.line,
						column: callSm.column
					});
					const arr = innerOnlyByCallSitePc.get(pc) ?? [];
					arr.push(typed);
					innerOnlyByCallSitePc.set(pc, arr);
					break;
				}
			}
		}
		const fromTopLevelByCallSitePc = /* @__PURE__ */ new Map();
		for (const th of typedHistories) {
			const view = th.view;
			const frames = getFrames(view);
			for (const pc of frames) {
				if (!callSiteByPc.has(pc)) continue;
				const arr = fromTopLevelByCallSitePc.get(pc);
				if (arr) arr.push(th);
				else fromTopLevelByCallSitePc.set(pc, [th]);
			}
		}
		const userCallHistories = [];
		for (const entry of callSiteEntries) {
			const fromTopLevel = fromTopLevelByCallSitePc.get(entry.pc) ?? [];
			const fromPrelude = innerOnlyByCallSitePc.get(entry.pc) ?? [];
			const inner = [...fromTopLevel, ...fromPrelude];
			if (inner.length > 0) userCallHistories.push({
				source: {
					line: entry.line,
					column: entry.column
				},
				funcName: entry.funcName,
				inner
			});
		}
		return {
			typedHistories,
			userCallHistories
		};
	}
	function Deferred() {
		const _onwhen = () => {
			deferred.hasSettled = true;
			deferred.resolve = deferred.reject = noop;
		};
		const noop = () => {};
		let onwhen = _onwhen;
		const deferred = {
			hasSettled: false,
			when: (fn) => {
				onwhen = () => {
					_onwhen();
					fn();
				};
			}
		};
		deferred.promise = new Promise((resolve, reject) => {
			deferred.resolve = (arg) => {
				onwhen();
				deferred.value = arg;
				resolve(arg);
			};
			deferred.reject = (error$1) => {
				onwhen();
				deferred.error = error$1;
				reject(error$1);
			};
		});
		return deferred;
	}
	function atomic(fn, { dropInbetween = false, timeout = null } = {}) {
		const queue = [];
		let isRunning = false;
		const apply = async (task) => {
			try {
				if (timeout) {
					const result = await Promise.race([fn.apply(task.context, task.args), new Promise((_$1, reject) => setTimeout(() => reject(/* @__PURE__ */ new Error("Timeout")), timeout))]);
					task.deferred.resolve(result);
				} else {
					const result = await fn.apply(task.context, task.args);
					task.deferred.resolve(result);
				}
			} catch (error$1) {
				task.deferred.reject(error$1);
			}
		};
		const drain = async () => {
			isRunning = true;
			if (dropInbetween) {
				const tasks = queue.splice(0);
				const last = tasks.pop();
				tasks.forEach((task) => task.deferred.reject(/* @__PURE__ */ new Error("Dropped")));
				await apply(last);
			} else await apply(queue.shift());
			if (queue.length) drain();
			else isRunning = false;
		};
		function cb(...args) {
			const task = {
				context: this,
				args,
				deferred: Deferred()
			};
			queue.push(task);
			if (!isRunning) drain();
			return task.deferred.promise;
		}
		return cb;
	}
	async function fetchFreesoundSample(ctx, id) {
		const url = `https://freesound.cowbell.workers.dev/get?id=${id}`;
		const response = await fetch(url);
		if (!response.ok) throw new Error(`Failed to fetch freesound ${id}: ${response.status}`);
		const arrayBuffer = await response.arrayBuffer();
		const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
		const channels = [];
		for (let ch = 0; ch < audioBuffer.numberOfChannels; ch++) channels.push(new Float32Array(audioBuffer.getChannelData(ch)));
		return {
			channels,
			sampleRate: audioBuffer.sampleRate
		};
	}
	async function fetchEspeakSample(ctx, opts) {
		const url = new URL("/mespeak", self.location?.origin ?? void 0);
		const speedParam = Math.round(Math.max(0, Math.min(200, opts.speed * 200)));
		const pitchParam = Math.round(Math.max(0, Math.min(100, opts.pitch * 100)));
		url.searchParams.set("text", opts.text);
		url.searchParams.set("variant", opts.variant);
		url.searchParams.set("speed", String(speedParam));
		url.searchParams.set("pitch", String(pitchParam));
		const response = await fetch(url.toString());
		if (!response.ok) throw new Error(`Failed to fetch espeak sample: ${response.status}`);
		const arrayBuffer = await response.arrayBuffer();
		const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
		const channels = [];
		for (let ch = 0; ch < audioBuffer.numberOfChannels; ch++) channels.push(new Float32Array(audioBuffer.getChannelData(ch)));
		return {
			channels,
			sampleRate: audioBuffer.sampleRate
		};
	}
	atomic(async (audioContext, worklet, record, fetchingSamples, programId, getRecordGeneration, recordCallbacks, mainBytecode, onCapturedValues) => {
		const generation = getRecordGeneration(programId);
		const toFetch = (await worklet.getRequiredSamples()).filter(({ handle }) => !fetchingSamples.has(handle));
		if (toFetch.length === 0) return;
		for (const { handle } of toFetch) fetchingSamples.add(handle);
		await Promise.all(toFetch.map(async ({ handle, freesoundId, recordSeconds, recordCallbackId }) => {
			if (freesoundId !== void 0) try {
				console.log(`[dsp] Fetching freesound ${freesoundId} for handle ${handle}...`);
				const { channels, sampleRate: sampleRate$1 } = await fetchFreesoundSample(audioContext, freesoundId);
				console.log(`[dsp] Fetched freesound ${freesoundId}: ${channels.length} channels, ${channels[0]?.length} samples at ${sampleRate$1}Hz`);
				const existing = sampleManager.getSample(handle);
				if (existing?.channels.length) for (let i$1 = 0; i$1 < existing.channels.length; i$1++) untrack(`sab-freesound-${handle}-${i$1}`);
				const sharedChannels = channels.map((ch, i$1) => {
					const sab = new SharedArrayBuffer(ch.byteLength);
					track(`sab-freesound-${handle}-${i$1}`, "SharedArrayBuffer", ch.byteLength, {
						source: "fetch-samples",
						handle
					});
					new Float32Array(sab).set(ch);
					return sab;
				});
				await worklet.setSampleData({
					handle,
					channels: sharedChannels,
					sampleRate: sampleRate$1
				});
				sampleManager.setSampleData(handle, channels, sampleRate$1);
				console.log(`[dsp] Set sample data for handle ${handle}`);
			} catch (error$1) {
				const msg = error$1 instanceof Error ? error$1.message : String(error$1);
				console.error(`[dsp] Error fetching freesound ${freesoundId}:`, msg);
				await worklet.setSampleError({
					handle,
					error: msg
				});
				sampleManager.setSampleError(handle, msg);
				throw error$1;
			} finally {
				fetchingSamples.delete(handle);
			}
			else if (recordSeconds !== void 0 && recordCallbackId !== void 0 && recordCallbacks && mainBytecode) try {
				const callbackData = recordCallbacks.get(recordCallbackId);
				if (!callbackData) throw new Error(`No callback bytecode found for callback ID ${recordCallbackId}`);
				const sampleRate$1 = 48e3;
				const numSamples = Math.floor(recordSeconds * sampleRate$1);
				console.log("[dsp] recordAndSend", handle);
				const capturedValues = await record.recordAndSend({
					handle,
					mainBytecode,
					setupBytecode: callbackData.setup,
					loopBytecode: callbackData.loop,
					captureStoreGlobalIdx: callbackData.captureStoreGlobalIdx,
					recordGlobalIndices: callbackData.recordGlobalIndices,
					defaultParamRecordGlobals: callbackData.defaultParamRecordGlobals,
					callbackId: recordCallbackId,
					useNestedCaptureStore: callbackData.useNestedCaptureStore ?? true,
					numSamples,
					sampleRate: sampleRate$1
				});
				if (getRecordGeneration(programId) !== generation) return;
				if (onCapturedValues) onCapturedValues(recordCallbackId, capturedValues);
			} catch (error$1) {
				if (getRecordGeneration(programId) !== generation) return;
				const msg = error$1 instanceof Error ? error$1.message : String(error$1);
				console.error(`[dsp] Error recording sample for callback ${recordCallbackId}:`, msg);
				throw error$1;
			} finally {
				fetchingSamples.delete(handle);
			}
		}));
	});
	function bytecodeStructureHash(bytecode) {
		const u32 = new Uint32Array(bytecode.buffer, bytecode.byteOffset, bytecode.length);
		const f32 = bytecode;
		const mix = (h$1, v$1) => {
			h$1 = (h$1 ^ v$1) >>> 0;
			h$1 = Math.imul(h$1, 16777619) >>> 0;
			return h$1 >>> 0;
		};
		const roundPosI32 = (x$1) => x$1 + .5 | 0;
		const hashRange = (startPc, limitPc, seed) => {
			let h$1 = seed >>> 0;
			let pc = startPc;
			while (pc < limitPc) {
				const op = u32[pc];
				h$1 = mix(h$1, op);
				pc++;
				const { kind } = getOpcodeInfo(op);
				switch (kind) {
					case "param":
					case "pc-param": {
						if (pc >= limitPc) throw new Error(`Invalid bytecode: missing param for op ${op} at pc ${pc - 1}`);
						const paramBits = u32[pc];
						const paramF = f32[pc];
						if (op === AudioVmOp.PushScalar || op === AudioVmOp.PushAudio || op === AudioVmOp.SetBpm) h$1 = mix(h$1, 0);
						else {
							const r$1 = roundPosI32(paramF) >>> 0;
							h$1 = mix(h$1, r$1 || paramBits);
						}
						pc++;
						break;
					}
					case "three-param":
						if (pc + 2 >= limitPc) throw new Error(`Invalid bytecode: missing 3 params for op ${op} at pc ${pc - 1}`);
						h$1 = mix(h$1, roundPosI32(f32[pc]) >>> 0);
						pc++;
						h$1 = mix(h$1, roundPosI32(f32[pc]) >>> 0);
						pc++;
						h$1 = mix(h$1, roundPosI32(f32[pc]) >>> 0);
						pc++;
						break;
					case "table": {
						if (pc >= limitPc) throw new Error(`Invalid bytecode: missing table len for op ${op} at pc ${pc - 1}`);
						const len = roundPosI32(f32[pc]);
						if (len < 0) throw new Error(`Invalid bytecode: negative table len ${len} for op ${op} at pc ${pc - 1}`);
						h$1 = mix(h$1, len >>> 0);
						const end = pc + 1 + len;
						if (end > limitPc) throw new Error(`Invalid bytecode: table overruns bytecode for op ${op} at pc ${pc - 1}`);
						pc = end;
						break;
					}
					case "define-function": {
						if (pc + 5 >= limitPc) throw new Error(`Invalid bytecode: missing function header for op ${op} at pc ${pc - 1}`);
						const functionId = roundPosI32(f32[pc]);
						pc++;
						const paramCount = roundPosI32(f32[pc]);
						pc++;
						const firstParamIn = roundPosI32(f32[pc]);
						pc++;
						const closureCount = roundPosI32(f32[pc]);
						pc++;
						const localCount = roundPosI32(f32[pc]);
						pc++;
						const bytecodeLength = roundPosI32(f32[pc]);
						pc++;
						if (bytecodeLength < 0) throw new Error(`Invalid bytecode: negative function bytecode len ${bytecodeLength}`);
						h$1 = mix(h$1, functionId >>> 0);
						h$1 = mix(h$1, paramCount >>> 0);
						h$1 = mix(h$1, firstParamIn >>> 0);
						h$1 = mix(h$1, closureCount >>> 0);
						h$1 = mix(h$1, localCount >>> 0);
						const innerStart = pc;
						const innerEnd = pc + bytecodeLength;
						if (innerEnd > limitPc) throw new Error(`Invalid bytecode: function overruns bytecode (end ${innerEnd}, limit ${limitPc})`);
						h$1 = hashRange(innerStart, innerEnd, h$1);
						pc = innerEnd;
						break;
					}
					case "none":
					default: break;
				}
			}
			return h$1 >>> 0;
		};
		return hashRange(0, bytecode.length, 2166136261);
	}
	const DEBUG_PREVIEW_TIMING = typeof process !== "undefined" && {}?.DEBUG_PREVIEW_TIMING === "1";
	function ensureMiniEntryPool(pool, size) {
		while (pool.length < size) pool.push({
			opIndex: 0,
			voiceIndex: 0,
			value: 0,
			velocity: 0,
			startSeconds: 0,
			endSeconds: 0
		});
	}
	function createDspPreview(runtime) {
		let previewAudioContext = null;
		const state = {
			bytecode: null,
			result: null,
			historySourceMap: [],
			sampleRate: 48e3,
			structureHash: 0,
			vmView: null,
			histories: [],
			userCallHistories: [],
			audioOpsPtr: 0,
			audioOpsCapacity: 0,
			lastBuiltStructureHash: 0,
			lastAppliedHistorySourceMap: [],
			miniBytecodePtr: 0,
			miniBytecodeCapacity: 0,
			miniHistoryPtr: 0,
			miniEntryPool: []
		};
		async function ensurePreviewSamples(registrations) {
			if (typeof AudioContext === "undefined") return;
			if (!previewAudioContext) try {
				previewAudioContext = new AudioContext({ latencyHint: "interactive" });
			} catch (e$1) {
				const msg = e$1 instanceof Error ? e$1.message : String(e$1);
				console.error("[preview] Failed to create AudioContext for espeak samples:", msg);
				return;
			}
			const ctx = previewAudioContext;
			for (const reg of registrations) if (reg.type === "inline" && reg.inlineChannels && reg.inlineSampleRate != null) sampleManager.setSampleData(reg.handle, reg.inlineChannels, reg.inlineSampleRate);
			else if (reg.type === "espeak" && reg.espeakText) {
				const text = reg.espeakText;
				const variant = reg.espeakVariant ?? "m1";
				const speed = reg.espeakSpeed ?? .5;
				const pitch = reg.espeakPitch ?? .5;
				try {
					const { channels, sampleRate: sampleRate$1 } = await fetchEspeakSample(ctx, {
						text,
						variant,
						speed,
						pitch
					});
					sampleManager.setSampleData(reg.handle, channels, sampleRate$1);
				} catch (error$1) {
					const msg = error$1 instanceof Error ? error$1.message : String(error$1);
					console.error("[preview] Error fetching espeak sample:", msg);
					sampleManager.setSampleError(reg.handle, msg);
				}
			}
		}
		return {
			setCode(code, opts) {
				const t0 = DEBUG_PREVIEW_TIMING ? performance.now() : 0;
				const result = controlPipeline.compileSource(code, opts);
				if (DEBUG_PREVIEW_TIMING) console.log("[preview] setCode", (performance.now() - t0).toFixed(2), "ms");
				if (result.errors.length > 0) console.error(/* @__PURE__ */ new Error(`Compilation failed:\n${result.errors.join("\n")}`));
				if (!result.compile.bytecode) console.error(/* @__PURE__ */ new Error("No bytecode generated"));
				state.result = result;
				state.bytecode = result.compile.bytecode;
				state.historySourceMap = result.compile.historySourceMap || [];
				if (state.bytecode) state.structureHash = bytecodeStructureHash(state.bytecode);
				if (result.compile.sampleRegistrations?.length) ensurePreviewSamples(result.compile.sampleRegistrations);
				return result;
			},
			runPreview(vmId = 0, sampleCount = 0, bufferLength = 128) {
				const t0 = DEBUG_PREVIEW_TIMING ? performance.now() : 0;
				if (!state.bytecode) throw new Error("No code set. Call setCode() first.");
				const nyquist = state.sampleRate / 2;
				const piOverNyquist = Math.PI / nyquist;
				const bpm = state.result.compile.bpm;
				runtime.resetAudioVmAt(vmId);
				const len = state.bytecode.length;
				if (state.audioOpsCapacity < len) {
					if (state.audioOpsPtr) runtime.freeFloat32Buffer(state.audioOpsPtr);
					state.audioOpsPtr = runtime.createFloat32Buffer(len);
					state.audioOpsCapacity = len;
				}
				const audioOpsPtr = state.audioOpsPtr;
				new Float32Array(runtime.buffer, audioOpsPtr, len).set(state.bytecode);
				runtime.runAudioVmAt(vmId, audioOpsPtr, len, bufferLength, sampleCount, state.sampleRate, nyquist, piOverNyquist, bpm);
				runtime.gc();
				const infoPtr = runtime.getAudioVmInfoPtr(vmId);
				if (!state.vmView || state.structureHash !== state.lastBuiltStructureHash) {
					state.vmView = new AudioVmView(runtime.memory, infoPtr);
					state.lastBuiltStructureHash = state.structureHash;
					state.lastAppliedHistorySourceMap = state.historySourceMap;
				} else if (state.historySourceMap !== state.lastAppliedHistorySourceMap) state.lastAppliedHistorySourceMap = state.historySourceMap;
				const result = createTypedHistories(state.vmView.histories, state.historySourceMap);
				state.histories = result.typedHistories;
				state.userCallHistories = result.userCallHistories;
				const vmView = state.vmView;
				const histories = state.histories;
				const userCallHistories = state.userCallHistories;
				if (DEBUG_PREVIEW_TIMING) console.log("[preview] runPreview", (performance.now() - t0).toFixed(2), "ms");
				return {
					vmView,
					histories,
					userCallHistories
				};
			},
			runMiniPreview(compileResult, startSeconds, endSeconds, bars) {
				const t0 = DEBUG_PREVIEW_TIMING ? performance.now() : 0;
				const result = state.result;
				if (!result) throw new Error("No code set. Call setCode() first.");
				const arraySize = MINI_ARRAY_HEADER_SIZE + compileResult.bytecode.length;
				if (state.miniBytecodeCapacity < arraySize) {
					if (state.miniBytecodePtr) runtime.freeFloat32Buffer(state.miniBytecodePtr);
					state.miniBytecodePtr = runtime.createFloat32Buffer(arraySize);
					state.miniBytecodeCapacity = arraySize;
				}
				if (!state.miniHistoryPtr) state.miniHistoryPtr = runtime.createFloat32Buffer(MINI_HISTORY_HEADER_SIZE + MINI_HISTORY_SIZE * MINI_HISTORY_ENTRY_SIZE);
				const bytecode$ = state.miniBytecodePtr;
				const history$ = state.miniHistoryPtr;
				const buf = runtime.memory.buffer;
				const array = new Float32Array(buf, bytecode$, arraySize);
				array[0] = compileResult.bytecode.length;
				array[1] = 1;
				array.set(compileResult.bytecode, MINI_ARRAY_HEADER_SIZE);
				const sampleRate$1 = 100;
				const windowStartSample = startSeconds * sampleRate$1;
				const windowEndSample = endSeconds * sampleRate$1;
				runtime.generateMiniHistoryWindow(bytecode$, history$, windowStartSample, windowEndSample, result.compile.bpm, sampleRate$1, bars);
				const historyLen = MINI_HISTORY_HEADER_SIZE + MINI_HISTORY_SIZE * MINI_HISTORY_ENTRY_SIZE;
				const history = new Float32Array(buf, history$, historyLen);
				const length = history[0];
				ensureMiniEntryPool(state.miniEntryPool, length);
				const pool = state.miniEntryPool;
				const entries = [];
				for (let i$1 = 0; i$1 < length; i$1++) {
					const base = MINI_HISTORY_HEADER_SIZE + i$1 * MINI_HISTORY_ENTRY_SIZE;
					const startSample = history[base + 4];
					const endSample = history[base + 5];
					const e$1 = pool[i$1];
					e$1.opIndex = history[base];
					e$1.voiceIndex = history[base + 1];
					e$1.value = history[base + 2];
					e$1.velocity = history[base + 3];
					e$1.startSeconds = startSample / sampleRate$1;
					e$1.endSeconds = endSample / sampleRate$1;
					entries.push({ ...e$1 });
				}
				if (DEBUG_PREVIEW_TIMING) console.log("[preview] runMiniPreview", (performance.now() - t0).toFixed(2), "ms");
				return entries;
			},
			*renderToAudio(code, bars, beatsPerBar = 4, vmId = 999) {
				const result = this.setCode(code);
				if (result.errors.length > 0) throw new Error(`Compilation failed:\n${result.errors.join("\n")}`);
				if (!state.bytecode) throw new Error("No bytecode generated");
				const bpm = result.compile.bpm;
				const totalSamples = Math.floor(bars * beatsPerBar * 60 / bpm * state.sampleRate);
				const chunk = 128;
				const numChunks = Math.ceil(totalSamples / chunk);
				const renderedLength = numChunks * chunk;
				const left = new Float32Array(renderedLength);
				const right = new Float32Array(renderedLength);
				const nyquist = state.sampleRate / 2;
				const piOverNyquist = Math.PI / nyquist;
				const audioOpsPtr = runtime.createFloat32Buffer(state.bytecode.length);
				new Float32Array(runtime.buffer, audioOpsPtr, state.bytecode.length).set(state.bytecode);
				runtime.resetAudioVmAt(vmId);
				let offset = 0;
				for (let i$1 = 0; i$1 < numChunks; i$1++) {
					runtime.runAudioVmAt(vmId, audioOpsPtr, state.bytecode.length, chunk, offset, state.sampleRate, nyquist, piOverNyquist, bpm);
					const infoPtr = runtime.getAudioVmInfoPtr(vmId);
					const aInfo = new Uint32Array(runtime.buffer, infoPtr, 10);
					const outputLeftPtr = aInfo[8];
					const outputRightPtr = aInfo[9];
					if (outputLeftPtr && outputRightPtr) {
						left.set(new Float32Array(runtime.buffer, outputLeftPtr, chunk), offset);
						right.set(new Float32Array(runtime.buffer, outputRightPtr, chunk), offset);
					}
					offset += chunk;
					if ((i$1 + 1) % 128 === 0 || i$1 === numChunks - 1) yield totalSamples > 0 ? Math.min(1, offset / totalSamples) : 1;
				}
				runtime.freeFloat32Buffer(audioOpsPtr);
				yield 1;
				return {
					left: left.subarray(0, totalSamples).slice(),
					right: right.subarray(0, totalSamples).slice()
				};
			}
		};
	}
	function getCapturedValuesFromCaptureStore(opts) {
		const { core, mainBytecode, captureStoreGlobalIdx, numDeps, defaultParamRecordGlobals, recordGlobalIndices, sampleRate: sampleRate$1, tempVmId = 0, bpm = 120, callbackId = 0, useNestedCaptureStore = false } = opts;
		const mainPtr = core.wasm.createFloat32Buffer(mainBytecode.length) >>> 0;
		new Float32Array(core.memory.buffer, mainPtr, mainBytecode.length).set(mainBytecode);
		core.wasm.resetAudioVmAt(tempVmId);
		const nyquist = sampleRate$1 / 2;
		core.wasm.runAudioVmAt(tempVmId, mainPtr, mainBytecode.length, 128, 0, sampleRate$1, nyquist, Math.PI / nyquist, bpm);
		const capturedValues = [];
		const skipIndices = /* @__PURE__ */ new Set();
		const undefinedRecordGlobals = /* @__PURE__ */ new Set();
		if (defaultParamRecordGlobals?.length) recordGlobalIndices.forEach((recordGlobalIdx, i$1) => {
			if (defaultParamRecordGlobals.includes(recordGlobalIdx)) skipIndices.add(i$1);
		});
		for (let i$1 = 0; i$1 < numDeps; i$1++) {
			const recordGlobalIdx = recordGlobalIndices[i$1];
			const isUndefined = useNestedCaptureStore ? core.wasm.getAudioVmNestedArrayElementIsUndefined(tempVmId, captureStoreGlobalIdx, callbackId, i$1) : core.wasm.getAudioVmArrayElementIsUndefined(tempVmId, captureStoreGlobalIdx, i$1);
			const value = useNestedCaptureStore ? core.wasm.getAudioVmNestedArrayElementAt(tempVmId, captureStoreGlobalIdx, callbackId, i$1) : core.wasm.getAudioVmArrayElementAt(tempVmId, captureStoreGlobalIdx, i$1);
			const treatAsUndefined = isUndefined || Number.isNaN(value);
			if (treatAsUndefined) undefinedRecordGlobals.add(recordGlobalIdx);
			capturedValues.push(skipIndices.has(i$1) ? 0 : treatAsUndefined ? 0 : value);
		}
		core.wasm.freeFloat32Buffer(mainPtr);
		const invalidIdx = capturedValues.findIndex((v$1, i$1) => !skipIndices.has(i$1) && Number.isNaN(v$1));
		if (invalidIdx >= 0) throw new Error(`Invalid capture at index ${invalidIdx}: captured variable is not a scalar (e.g. was reassigned to a function or array).`);
		return {
			capturedValues,
			undefinedRecordGlobals
		};
	}
	function findMaxRecordGlobalIdx(recordGlobalIndices) {
		let maxRecordGlobalIdx = -1;
		for (const recordGlobalIdx of recordGlobalIndices) if (recordGlobalIdx > maxRecordGlobalIdx) maxRecordGlobalIdx = recordGlobalIdx;
		return maxRecordGlobalIdx;
	}
	function preSizeGlobalsArray(core, minSize) {
		if (minSize <= 0) return;
		core.wasm.ensureSampleRecordGlobalsSize(minSize);
	}
	function setCapturedValues(core, recordGlobalIndices, capturedValues, skipRecordGlobals, recordVmId$1) {
		for (let i$1 = 0; i$1 < recordGlobalIndices.length; i$1++) {
			const recordGlobalIdx = recordGlobalIndices[i$1];
			if (skipRecordGlobals.has(recordGlobalIdx)) continue;
			const value = capturedValues[i$1] ?? 0;
			core.wasm.setSampleRecordGlobal(recordGlobalIdx, value);
		}
	}
	function initializeSampleRecord(core, setupBytecode, loopBytecode, numSamples, sampleRate$1) {
		const setupPtr = core.wasm.createFloat32Buffer(setupBytecode.length) >>> 0;
		new Float32Array(core.memory.buffer, setupPtr, setupBytecode.length).set(setupBytecode);
		const loopPtr = core.wasm.createFloat32Buffer(loopBytecode.length) >>> 0;
		new Float32Array(core.memory.buffer, loopPtr, loopBytecode.length).set(loopBytecode);
		core.wasm.initSampleRecord(setupPtr, setupBytecode.length, loopPtr, loopBytecode.length, numSamples, sampleRate$1);
		core.wasm.freeFloat32Buffer(setupPtr);
		core.wasm.freeFloat32Buffer(loopPtr);
	}
	function runRecordSetup(core) {
		core.wasm.runSampleRecordSetup();
	}
	function executeRecordLoop(core) {
		core.wasm.recordSampleAll();
	}
	function extractRecordOutput(core, numSamples) {
		const outputPtr = core.wasm.getSampleRecordOutputPtr() >>> 0;
		const output = new Float32Array(numSamples);
		const wasmOutput = new Float32Array(core.memory.buffer, outputPtr, numSamples);
		output.set(wasmOutput);
		return output;
	}
	function executeRecordCallbackWithSampleRecord(opts) {
		const { core, setupBytecode, loopBytecode, recordGlobalIndices, capturedValues, defaultParamRecordGlobals, undefinedRecordGlobals, maxSetupGlobalIndex, numSamples, sampleRate: sampleRate$1 } = opts;
		initializeSampleRecord(core, setupBytecode, loopBytecode, numSamples, sampleRate$1);
		const maxRecordGlobalIdx = findMaxRecordGlobalIdx(recordGlobalIndices);
		preSizeGlobalsArray(core, Math.max(maxRecordGlobalIdx, opts.maxSetupGlobalIndex ?? -1) + 1);
		setCapturedValues(core, recordGlobalIndices, capturedValues, new Set(undefinedRecordGlobals ?? []), 1);
		runRecordSetup(core);
		executeRecordLoop(core);
		return extractRecordOutput(core, numSamples);
	}
	function processRecordRequest(opts) {
		const { core, recordRequest, recordCallbacks, mainBytecode, sampleRate: sampleRate$1 = 48e3, bpm = 120, tempVmId = 0 } = opts;
		const { seconds, callbackId } = recordRequest;
		const callbackData = recordCallbacks.get(callbackId);
		if (!callbackData) return null;
		const { setup: setupBytecode, loop: loopBytecode, captureStoreGlobalIdx, recordGlobalIndices, defaultParamRecordGlobals, maxSetupGlobalIndex } = callbackData;
		const numSamples = Math.floor(seconds * sampleRate$1);
		const numDeps = recordGlobalIndices.length;
		try {
			const { capturedValues, undefinedRecordGlobals } = getCapturedValuesFromCaptureStore({
				core,
				mainBytecode,
				captureStoreGlobalIdx,
				numDeps,
				defaultParamRecordGlobals,
				recordGlobalIndices,
				sampleRate: sampleRate$1,
				tempVmId,
				bpm,
				callbackId,
				useNestedCaptureStore: callbackData.useNestedCaptureStore
			});
			return {
				output: executeRecordCallbackWithSampleRecord({
					core,
					setupBytecode,
					loopBytecode,
					recordGlobalIndices,
					capturedValues,
					defaultParamRecordGlobals,
					undefinedRecordGlobals,
					maxSetupGlobalIndex,
					numSamples,
					sampleRate: sampleRate$1
				}),
				capturedValues
			};
		} catch (error$1) {
			console.groupCollapsed("Main bytecode");
			console.log(disassembleBytecode(mainBytecode).join("\n"));
			console.groupEnd();
			throw error$1;
		}
	}
	function createWasmImports(memory) {
		return {
			debug: { debugAudioVmOp: (pc, op = -1, stackTop) => {} },
			sample: {
				readSampleChunk: (sampleHandle, channel, startSample, length, destPtr) => {
					const sample = sampleManager.getSample(sampleHandle);
					if (!sample || !sample.ready) {
						const chunk$1 = new Float32Array(length);
						new Float32Array(memory.buffer, destPtr, length).set(chunk$1);
						return;
					}
					const chunk = sampleManager.readChunk(sampleHandle, channel, startSample, length);
					new Float32Array(memory.buffer, destPtr, length).set(chunk);
				},
				getSampleLength: (sampleHandle, channel) => {
					const sample = sampleManager.getSample(sampleHandle);
					return !sample || !sample.ready ? 0 : sample.channels[channel] ? sample.channels[channel].length : 0;
				},
				getSampleChannelCount: (sampleHandle) => {
					const sample = sampleManager.getSample(sampleHandle);
					if (!sample || !sample.ready) return 0;
					return sample.channels.length;
				},
				getSliceCount: (sampleHandle, threshold) => {
					return sampleManager.getSlices(sampleHandle, threshold).count;
				},
				getSlicePoint: (sampleHandle, threshold, index) => {
					const result = sampleManager.getSlices(sampleHandle, threshold);
					if (index < 0 || index >= result.count) return 0;
					return result.points[index] ?? 0;
				},
				getSampleVersion: (sampleHandle) => sampleManager.getSampleVersion(sampleHandle)
			}
		};
	}
	function createWasmRuntime(core) {
		const { wasm, memory } = core;
		return {
			get memory() {
				return memory;
			},
			get buffer() {
				return memory.buffer;
			},
			createFloat32Buffer(capacity) {
				return wasm.createFloat32Buffer(capacity);
			},
			freeFloat32Buffer(ptr) {
				wasm.freeFloat32Buffer(ptr >>> 0);
			},
			copyAudioVmState(fromVmId, toVmId) {
				wasm.copyAudioVmState(fromVmId, toVmId);
			},
			getAudioVmInfoPtr(vmId) {
				return wasm.getAudioVmInfoAt(vmId);
			},
			generateMiniHistoryWindow(bytecodePtr, historyPtr, windowStartSample, windowEndSample, bpm, sampleRate$1, barValue) {
				wasm.generateMiniHistoryWindow(bytecodePtr, historyPtr, windowStartSample, windowEndSample, bpm, sampleRate$1, barValue);
			},
			runAudioVmAt(vmId, audioOpsPtr, controlOpsLength, bufferLength, sampleCount, sampleRate$1, nyquist, piOverNyquist, bpm) {
				wasm.runAudioVmAt(vmId, audioOpsPtr, controlOpsLength, bufferLength, sampleCount, sampleRate$1, nyquist, piOverNyquist, bpm);
			},
			resetAudioVmAt(vmId) {
				wasm.resetAudioVmAt(vmId);
			},
			gc() {
				wasm.__collect();
			},
			memoryGrow(delta) {
				return wasm.memoryGrow(delta);
			},
			memoryUsage() {
				return wasm.memoryUsage();
			},
			setBpmOverride(bpm) {
				wasm.bpmOverride(bpm);
			}
		};
	}
	const section = "sourceMappingURL";
	function read_uint(buf, pos = 0) {
		let n$1 = 0;
		let shift = 0;
		let b$1 = buf[pos];
		let outpos = pos + 1;
		while (b$1 >= 128) {
			n$1 = n$1 | b$1 - 128 << shift;
			b$1 = buf[outpos];
			outpos++;
			shift += 7;
		}
		return [n$1 + (b$1 << shift), outpos];
	}
	function encode_uint(n$1) {
		let result = [];
		while (n$1 > 127) {
			result.push(128 | n$1 & 127);
			n$1 = n$1 >> 7;
		}
		result.push(n$1);
		return new Uint8Array(result);
	}
	function ab2str(buf) {
		let str = "";
		let bytes = new Uint8Array(buf);
		for (let i$1 = 0; i$1 < bytes.length; i$1++) str += String.fromCharCode(bytes[i$1]);
		return str;
	}
	function str2ab(str) {
		let bytes = new Uint8Array(str.length);
		for (let i$1 = 0; i$1 < str.length; i$1++) bytes[i$1] = str[i$1].charCodeAt(0);
		return bytes;
	}
	function writeSection(name, value) {
		const nameBuf = str2ab(name);
		const valBuf = str2ab(value);
		const nameLen = encode_uint(nameBuf.length);
		const valLen = encode_uint(valBuf.length);
		const sectionLen = nameLen.length + nameBuf.length + valLen.length + valBuf.length;
		const headerLen = encode_uint(sectionLen);
		let bytes = new Uint8Array(sectionLen + headerLen.length + 1);
		let pos = 1;
		bytes.set(headerLen, pos);
		pos += headerLen.length;
		bytes.set(nameLen, pos);
		pos += nameLen.length;
		bytes.set(nameBuf, pos);
		pos += nameBuf.length;
		bytes.set(valLen, pos);
		pos += valLen.length;
		bytes.set(valBuf, pos);
		return bytes;
	}
	function findSection(buf, id) {
		let pos = 8;
		while (pos < buf.byteLength) {
			const sec_start = pos;
			const [sec_id, pos2] = read_uint(buf, pos);
			const [sec_size, body_pos] = read_uint(buf, pos2);
			pos = body_pos + sec_size;
			if (sec_id == 0) {
				const [name_len, name_pos] = read_uint(buf, body_pos);
				if (ab2str(buf.slice(name_pos, name_pos + name_len)) == id) return [
					sec_start,
					sec_size + 1 + (body_pos - pos2),
					name_pos + name_len
				];
			}
		}
		return [
			-1,
			null,
			null
		];
	}
	const wasmSourceMap = {
		getSourceMapURL: function(buf) {
			buf = new Uint8Array(buf);
			const [sec_start, _$1, uri_start] = findSection(buf, section);
			if (sec_start == -1) return null;
			const [uri_len, uri_pos] = read_uint(buf, uri_start);
			return ab2str(buf.slice(uri_pos, uri_pos + uri_len));
		},
		removeSourceMapURL: function(buf) {
			buf = new Uint8Array(buf);
			const [sec_start, sec_size, _$1] = findSection(buf, section);
			if (sec_start == -1) return buf;
			let strippedBuf = new Uint8Array(buf.length - sec_size);
			strippedBuf.set(buf.slice(0, sec_start));
			strippedBuf.set(buf.slice(sec_start + sec_size), sec_start);
			return strippedBuf;
		},
		setSourceMapURL: function(buf, url) {
			const stripped = this.removeSourceMapURL(buf);
			const newSection = writeSection(section, url);
			const outBuf = new Uint8Array(stripped.length + newSection.length);
			outBuf.set(stripped);
			outBuf.set(newSection, stripped.length);
			return outBuf;
		}
	};
	function liftString(memory, pointer) {
		if (!pointer) return "";
		const end = pointer + new Uint32Array(memory.buffer)[pointer - 4 >>> 2] >>> 1, memoryU16 = new Uint16Array(memory.buffer);
		let start = pointer >>> 1, string = "";
		while (end - start > 1024) string += String.fromCharCode(...memoryU16.subarray(start, start += 1024));
		return string + String.fromCharCode(...memoryU16.subarray(start, end));
	}
	async function wasmSetup({ binary, sourcemapUrl, config, imports }) {
		const buffer = wasmSourceMap.setSourceMapURL(binary, sourcemapUrl);
		const uint8 = new Uint8Array(buffer);
		const memory = new WebAssembly.Memory({
			initial: config.options.initialMemory,
			maximum: config.options.maximumMemory,
			shared: config.options.sharedMemory
		});
		const mod = await WebAssembly.compile(uint8.buffer);
		const extraImports = typeof imports === "function" ? imports({ memory }) : imports;
		const importObject = { env: {
			memory,
			abort(message$, fileName$, lineNumber$, columnNumber$) {
				const message = liftString(memory, message$ >>> 0);
				const fileName = liftString(memory, fileName$ >>> 0);
				const lineNumber = lineNumber$ >>> 0;
				const columnNumber = columnNumber$ >>> 0;
				throw new Error(`${message} in ${fileName}:${lineNumber}:${columnNumber}`);
			},
			seed: () => Date.now() * Math.random(),
			log: console.log,
			warn: console.warn,
			"console.log": (textPtr) => {
				console.log(liftString(memory, textPtr));
			},
			"console.warn": (textPtr) => {
				console.warn(liftString(memory, textPtr));
			}
		} };
		if (extraImports) for (const k$1 of Object.keys(extraImports)) {
			const mod$1 = extraImports[k$1];
			if (!mod$1) continue;
			importObject[k$1] = {
				...importObject[k$1],
				...mod$1
			};
		}
		return {
			wasm: (await WebAssembly.instantiate(mod, importObject)).exports,
			memory
		};
	}
	const width = 256;
	const height = 96;
	const fftSize = 1024;
	const sampleRate = 48e3;
	const minFrequency = 20;
	const maxFrequency = 2e4;
	const dynamicRangeDb = 36;
	const renderVmId = 777;
	const recordVmId = 778;
	const maxAnalysisFramesPerColumn = 8;
	const renderCacheVersion = 3;
	let previewPromise = null;
	const renderCache = /* @__PURE__ */ new Map();
	const fftBitReversal = createBitReversalTable(fftSize);
	const spectrogramBands = createSpectrogramBands();
	self.onmessage = (event) => {
		renderRequest(event.data);
	};
	async function renderRequest(request) {
		try {
			sendProgress(request.id, .02);
			const cacheKey = getCacheKey(request);
			const cached = renderCache.get(cacheKey);
			if (cached) {
				const pixels$1 = cached.slice();
				self.postMessage({
					id: request.id,
					type: "result",
					width,
					height,
					pixels: pixels$1
				}, [pixels$1.buffer]);
				return;
			}
			const previewRuntime = await getPreview();
			sendProgress(request.id, .08);
			const code = buildPreviewCode(request);
			const bars = Math.max(.25, request.lengthBars || 1);
			let step;
			const generator = renderToAudio(previewRuntime, code, bars, 4, renderVmId);
			while (!(step = generator.next()).done) {
				sendProgress(request.id, .08 + clamp(step.value, 0, 1) * .72);
				await new Promise((resolve) => setTimeout(resolve, 0));
			}
			const mono = mixMono(step.value.left, step.value.right);
			sendProgress(request.id, .84);
			const pixels = computeSpectrogram(mono);
			rememberCache(cacheKey, pixels);
			self.postMessage({
				id: request.id,
				type: "result",
				width,
				height,
				pixels
			}, [pixels.buffer]);
		} catch (error$1) {
			const cacheKey = getCacheKey(request);
			const cached = renderCache.get(cacheKey);
			if (cached) {
				const pixels$1 = cached.slice();
				self.postMessage({
					id: request.id,
					type: "result",
					width,
					height,
					pixels: pixels$1
				}, [pixels$1.buffer]);
				return;
			}
			const debugError = serializeError(error$1);
			console.error("[spectrogram-worker] Render failed", {
				error: debugError,
				blockId: request.blockId,
				name: request.name,
				templateId: request.templateId,
				lengthBars: request.lengthBars,
				bpm: request.bpm,
				code: request.code,
				previewCode: buildPreviewCode(request)
			});
			const pixels = emptySpectrogram();
			self.postMessage({
				id: request.id,
				type: "result",
				width,
				height,
				pixels,
				error: debugError
			}, [pixels.buffer]);
		}
	}
	function serializeError(error$1) {
		if (error$1 instanceof Error) return {
			message: error$1.message || "Spectrogram render failed",
			name: error$1.name,
			stack: error$1.stack
		};
		return { message: String(error$1 || "Spectrogram render failed") };
	}
	function sendProgress(id, progress) {
		self.postMessage({
			id,
			type: "progress",
			progress: clamp(progress, 0, 1)
		});
	}
	async function getPreview() {
		if (previewPromise) return previewPromise;
		previewPromise = (async () => {
			const response = await fetch("/as/build/index.wasm");
			if (!response.ok) throw new Error(`Failed to fetch WASM: ${response.status}`);
			const core = await wasmSetup({
				binary: await response.arrayBuffer(),
				sourcemapUrl: "/as/build/index.wasm.map",
				config: asconfig_default,
				imports: ({ memory }) => createWasmImports(memory)
			});
			const runtime = createWasmRuntime(core);
			return {
				preview: createDspPreview(runtime),
				runtime,
				core
			};
		})();
		return previewPromise;
	}
	function* renderToAudio(previewRuntime, code, bars, beatsPerBar = 4, vmId = 999) {
		const { preview, runtime, core } = previewRuntime;
		const result = preview.setCode(code);
		if (result.errors.length > 0) throw new Error(`Compilation failed:\n${result.errors.join("\n")}`);
		if (!result.compile.bytecode) throw new Error("No bytecode generated");
		const bytecode = trimAudioBytecode(result.compile.bytecode);
		const bpm = result.compile.bpm;
		ensureRecordSamples({
			core,
			registrations: result.compile.sampleRegistrations,
			recordCallbacks: result.compile.recordCallbacks,
			mainBytecode: bytecode,
			bpm
		});
		const totalSamples = Math.floor(bars * beatsPerBar * 60 / bpm * sampleRate);
		const chunk = 128;
		const numChunks = Math.ceil(totalSamples / chunk);
		const renderedLength = numChunks * chunk;
		const left = new Float32Array(renderedLength);
		const right = new Float32Array(renderedLength);
		const nyquist = sampleRate / 2;
		const piOverNyquist = Math.PI / nyquist;
		const audioOpsPtr = runtime.createFloat32Buffer(bytecode.length);
		try {
			new Float32Array(runtime.buffer, audioOpsPtr, bytecode.length).set(bytecode);
			runtime.resetAudioVmAt(vmId);
			let offset = 0;
			for (let i$1 = 0; i$1 < numChunks; i$1++) {
				runtime.runAudioVmAt(vmId, audioOpsPtr, bytecode.length, chunk, offset, sampleRate, nyquist, piOverNyquist, bpm);
				const infoPtr = runtime.getAudioVmInfoPtr(vmId);
				const aInfo = new Uint32Array(runtime.buffer, infoPtr, 10);
				const outputLeftPtr = aInfo[8];
				const outputRightPtr = aInfo[9];
				if (outputLeftPtr && outputRightPtr) {
					left.set(new Float32Array(runtime.buffer, outputLeftPtr, chunk), offset);
					right.set(new Float32Array(runtime.buffer, outputRightPtr, chunk), offset);
				}
				offset += chunk;
				if ((i$1 + 1) % 128 === 0 || i$1 === numChunks - 1) yield totalSamples > 0 ? Math.min(1, offset / totalSamples) : 1;
			}
		} finally {
			runtime.freeFloat32Buffer(audioOpsPtr);
		}
		yield 1;
		return {
			left: left.subarray(0, totalSamples).slice(),
			right: right.subarray(0, totalSamples).slice()
		};
	}
	function trimAudioBytecode(bytecode) {
		const postIndex = new Uint32Array(bytecode.buffer, bytecode.byteOffset, bytecode.length).findLastIndex((opcode) => opcode === AudioVmOp.Post);
		return postIndex >= 0 ? bytecode.subarray(0, postIndex + 1) : bytecode;
	}
	function ensureRecordSamples({ core, registrations, recordCallbacks, mainBytecode, bpm }) {
		for (const registration of registrations) {
			if (registration.type === "inline" && registration.inlineChannels && registration.inlineSampleRate != null) {
				sampleManager.setSampleData(registration.handle, registration.inlineChannels, registration.inlineSampleRate);
				continue;
			}
			if (registration.type !== "record" || registration.recordSeconds == null || registration.recordCallbackId == null) continue;
			const record = processRecordRequest({
				core,
				recordRequest: {
					seconds: registration.recordSeconds,
					callbackId: registration.recordCallbackId
				},
				recordCallbacks: recordCallbacks ?? /* @__PURE__ */ new Map(),
				mainBytecode,
				sampleRate,
				bpm,
				tempVmId: recordVmId
			});
			if (!record) {
				sampleManager.setSampleError(registration.handle, `No record callback ${registration.recordCallbackId}`);
				continue;
			}
			sampleManager.setSampleData(registration.handle, [record.output], sampleRate);
		}
	}
	function buildPreviewCode(request) {
		const source = stripOutputPipes(request.code).trim() || "dc(0)";
		return [
			`bpm=${formatNumber(clamp(request.bpm || 120, 20, 260))}`,
			"lm_preview=(_lm_preview_arg)->{",
			"  bt=t",
			indent(source),
			"}",
			"out(lm_preview(0))"
		].join("\n");
	}
	function computeSpectrogram(samples) {
		const pixels = new Uint8ClampedArray(width * height * 4);
		const window$1 = hannWindow(fftSize);
		const decibels = new Float32Array(width * height);
		const real = new Float32Array(fftSize);
		const imaginary = new Float32Array(fftSize);
		const powerSpectrum = new Float32Array(fftSize / 2 + 1);
		const bandPowers = new Float32Array(height);
		let peakDb = -Infinity;
		for (let column = 0; column < width; column++) {
			bandPowers.fill(0);
			const columnStart = Math.floor(column / width * samples.length);
			const columnLength = Math.max(columnStart + 1, Math.floor((column + 1) / width * samples.length)) - columnStart;
			const frameCount = clampInt(Math.ceil(columnLength / (fftSize / 2)), 1, maxAnalysisFramesPerColumn);
			for (let frame = 0; frame < frameCount; frame++) {
				const start = columnStart + Math.floor((frame + .5) / frameCount * columnLength) - Math.floor(fftSize / 2);
				for (let i$1 = 0; i$1 < fftSize; i$1++) {
					real[i$1] = (samples[start + i$1] ?? 0) * window$1[i$1];
					imaginary[i$1] = 0;
				}
				fft(real, imaginary);
				for (let bin = 0; bin < powerSpectrum.length; bin++) {
					const re = real[bin];
					const im = imaginary[bin];
					powerSpectrum[bin] = (re * re + im * im) / (fftSize * fftSize);
				}
				for (let row = 0; row < height; row++) {
					const band = spectrogramBands[row];
					let power = 0;
					for (let bin = band.startBin; bin <= band.endBin; bin++) power += powerSpectrum[bin] ?? 0;
					power /= band.endBin - band.startBin + 1;
					bandPowers[row] = Math.max(bandPowers[row], power);
				}
			}
			for (let row = 0; row < height; row++) {
				const value = 10 * Math.log10(bandPowers[row] + 1e-20);
				decibels[row * width + column] = value;
				peakDb = Math.max(peakDb, value);
			}
		}
		if (!Number.isFinite(peakDb)) return pixels;
		const floorDb = peakDb - dynamicRangeDb;
		const columnEnergy = new Float32Array(width);
		const rowMinEnergy = new Float32Array(height);
		const rowMaxEnergy = new Float32Array(height);
		rowMinEnergy.fill(1);
		let maxColumnEnergy = 0;
		let minColumnEnergy = 1;
		for (let column = 0; column < width; column++) {
			let sum = 0;
			for (let row = 0; row < height; row++) {
				const normalized = normalizeDb(decibels[row * width + column], floorDb);
				rowMinEnergy[row] = Math.min(rowMinEnergy[row], normalized);
				rowMaxEnergy[row] = Math.max(rowMaxEnergy[row], normalized);
				sum += normalized * normalized;
			}
			const rms = Math.sqrt(sum / height);
			columnEnergy[column] = rms;
			maxColumnEnergy = Math.max(maxColumnEnergy, rms);
			minColumnEnergy = Math.min(minColumnEnergy, rms);
		}
		const columnRange = Math.max(.001, maxColumnEnergy - minColumnEnergy);
		for (let row = 0; row < height; row++) {
			const freq = 1 - row / Math.max(1, height - 1);
			const rowRange = Math.max(.001, rowMaxEnergy[row] - rowMinEnergy[row]);
			for (let column = 0; column < width; column++) {
				const absoluteEnergy = normalizeDb(decibels[row * width + column], floorDb);
				const rowContrast = clamp((absoluteEnergy - rowMinEnergy[row]) / rowRange, 0, 1);
				const columnContrast = clamp((columnEnergy[column] - minColumnEnergy) / columnRange, 0, 1);
				const transientEnergy = Math.pow(rowContrast * columnContrast, .72);
				const bedEnergy = Math.pow(absoluteEnergy, 1.55) * .42;
				const energy = clamp(Math.max(bedEnergy, transientEnergy), 0, 1);
				const index = (row * width + column) * 4;
				const [r$1, g$1, b$1, a$1] = heatColor(energy, freq);
				pixels[index] = r$1;
				pixels[index + 1] = g$1;
				pixels[index + 2] = b$1;
				pixels[index + 3] = a$1;
			}
		}
		return pixels;
	}
	function createSpectrogramBands() {
		const nyquist = sampleRate / 2;
		const maxFreq = Math.min(maxFrequency, nyquist);
		const binHz = sampleRate / fftSize;
		const ratio = maxFreq / minFrequency;
		return Array.from({ length: height }).map((_$1, row) => {
			const high = minFrequency * ratio ** (1 - row / height);
			const low = minFrequency * ratio ** (1 - (row + 1) / height);
			const startBin = clampInt(Math.floor(low / binHz), 1, fftSize / 2);
			return {
				startBin,
				endBin: clampInt(Math.ceil(high / binHz), startBin, fftSize / 2)
			};
		});
	}
	function createBitReversalTable(size) {
		const bits = Math.log2(size);
		const table = new Uint16Array(size);
		for (let i$1 = 0; i$1 < size; i$1++) {
			let x$1 = i$1;
			let y$1 = 0;
			for (let bit = 0; bit < bits; bit++) {
				y$1 = y$1 << 1 | x$1 & 1;
				x$1 >>= 1;
			}
			table[i$1] = y$1;
		}
		return table;
	}
	function fft(real, imaginary) {
		const n$1 = real.length;
		for (let i$1 = 0; i$1 < n$1; i$1++) {
			const j$1 = fftBitReversal[i$1];
			if (j$1 <= i$1) continue;
			const realValue = real[i$1];
			const imaginaryValue = imaginary[i$1];
			real[i$1] = real[j$1];
			imaginary[i$1] = imaginary[j$1];
			real[j$1] = realValue;
			imaginary[j$1] = imaginaryValue;
		}
		for (let size = 2; size <= n$1; size <<= 1) {
			const halfSize = size >> 1;
			const phaseStep = -2 * Math.PI / size;
			const stepReal = Math.cos(phaseStep);
			const stepImaginary = Math.sin(phaseStep);
			for (let start = 0; start < n$1; start += size) {
				let wr = 1;
				let wi = 0;
				for (let offset = 0; offset < halfSize; offset++) {
					const even = start + offset;
					const odd = even + halfSize;
					const oddReal = real[odd];
					const oddImaginary = imaginary[odd];
					const tr = wr * oddReal - wi * oddImaginary;
					const ti = wr * oddImaginary + wi * oddReal;
					real[odd] = real[even] - tr;
					imaginary[odd] = imaginary[even] - ti;
					real[even] = real[even] + tr;
					imaginary[even] = imaginary[even] + ti;
					const nextWr = wr * stepReal - wi * stepImaginary;
					wi = wr * stepImaginary + wi * stepReal;
					wr = nextWr;
				}
			}
		}
	}
	function hannWindow(size) {
		const window$1 = new Float32Array(size);
		for (let i$1 = 0; i$1 < size; i$1++) window$1[i$1] = .5 - .5 * Math.cos(2 * Math.PI * i$1 / Math.max(1, size - 1));
		return window$1;
	}
	function emptySpectrogram() {
		return new Uint8ClampedArray(width * height * 4);
	}
	function mixMono(left, right) {
		const length = Math.min(left.length, right.length);
		const mono = new Float32Array(length);
		for (let i$1 = 0; i$1 < length; i$1++) mono[i$1] = (left[i$1] + right[i$1]) * .5;
		return mono;
	}
	function stripOutputPipes(code) {
		return code.replace(/\|>\s*(?:out|outs|solo|sout)\s*\([^)]*\)/g, "").trim();
	}
	function indent(value) {
		return value.split("\n").map((line) => `  ${line}`).join("\n");
	}
	function formatNumber(value) {
		return Number.isInteger(value) ? String(value) : Number(value.toFixed(4)).toString();
	}
	function getCacheKey(request) {
		return `${renderCacheVersion}\n${request.templateId ?? ""}\n${request.name}\n${request.bpm}\n${request.lengthBars}\n${request.code}`;
	}
	function rememberCache(key, pixels) {
		if (renderCache.size > 120) {
			const first = renderCache.keys().next().value;
			if (first) renderCache.delete(first);
		}
		renderCache.set(key, pixels.slice());
	}
	function normalizeDb(value, floorDb) {
		return clamp((value - floorDb) / dynamicRangeDb, 0, 1);
	}
	function heatColor(energy, freq) {
		if (energy < .08) return [
			7,
			10,
			18,
			Math.round(energy * 160)
		];
		if (energy < .28) return [
			20,
			Math.round(145 + freq * 80),
			220,
			Math.round(38 + energy * 210)
		];
		if (energy < .55) return [
			142,
			92,
			246,
			Math.round(58 + energy * 220)
		];
		if (energy < .82) return [
			245,
			Math.round(120 + freq * 90),
			32,
			Math.round(78 + energy * 190)
		];
		return [
			255,
			Math.round(210 - freq * 95),
			Math.round(64 + freq * 80),
			Math.round(112 + energy * 130)
		];
	}
	function clamp(value, min, max) {
		return Math.max(min, Math.min(max, value));
	}
	function clampInt(value, min, max) {
		return Math.max(min, Math.min(max, value)) | 0;
	}
})();

//# sourceMappingURL=spectrogram-worker-jChgxk4f.js.map