describe('utils', () => {
	describe('clamp()', () => {
		it('grampos pequenos valores', () => {
			expect(clamp(5, 10, 20)).toBe(10);
		});

		it('prende valores grandes', () => {
			expect(clamp(15, 2, 12)).toBe(12);
		});

		it('não fixa valores dentro do intervalo', () => {
			expect(clamp(20, 1, 99)).toBe(20);
		});
	});

	describe('lerp()', () => {
		it('preserves start', () => {
			expect(lerp(10, 20, 0)).toBe(10);
		});

		it('preserves end', () => {
			expect(lerp(10, 20, 1)).toBe(20);
		});

		it('interpolates linearly', () => {
			expect(lerp(-100, 100, 0.25)).toBe(-50);
			expect(lerp(-100, 100, 0.5)).toBe(0);
			expect(lerp(-100, 100, 0.75)).toBe(50);
		});
	});

	test('colorToHex', () => {
		expect(colorToHex({ r: 0, g: 0, b: 0 })).toBe('#000000');
		expect(colorToHex({ r: 0x31, g: 0x4f, b: 0x6c })).toBe('#314f6c');
	});

	test('shadeColor', () => {
		// leveza de 1 sempre vai para branco total
		expect(shadeColor({ r: 0, g: 0, b: 0 }, 1)).toBe('#ffffff');
		// leveza de 0 sempre vai para preto total
		expect(shadeColor({ r: 127, g: 127, b: 127 }, 0)).toBe('#000000');
		// leveza de 0,5 não muda de cor
		expect(shadeColor({ r: 0x31, g: 0x4f, b: 0x6c }, 0.5)).toBe('#314f6c');
		// pode clarear as cores
		expect(shadeColor({ r: 0x31, g: 0x4f, b: 0x6c }, 0.75)).toBe('#98a7b5');
		// pode escurecer as cores
		expect(shadeColor({ r: 0x31, g: 0x4f, b: 0x6c }, 0.25)).toBe('#182736');
	});

	describe('makeCooldown()', () => {
		const resetTime = () => state.game.time = 0;
		const advanceTime = ms => state.game.time += ms;

		describe('1 unidades (padrão)', () => {
			it('pode ser usado imediatamente após a instanciação', () => {
				// Hora de início arbitrária.
				advanceTime(5000);
				const cooldown = makeCooldown(1000);

				expect(cooldown.canUse()).toBe(true);
				expect(cooldown.useIfAble()).toBe(true);
				// Deve ser inutilizável após
				expect(cooldown.canUse()).toBe(false);
				expect(cooldown.useIfAble()).toBe(false);
			});

			it('requer carregamento', () => {
				resetTime();
				const cooldown = makeCooldown(1000);

				expect(cooldown.useIfAble()).toBe(true);
				advanceTime(500);
				expect(cooldown.canUse()).toBe(false);
				expect(cooldown.useIfAble()).toBe(false);
				advanceTime(500);
				expect(cooldown.canUse()).toBe(true);
				expect(cooldown.useIfAble()).toBe(true);
			});

			test('useIfAble() não tem efeitos colaterais quando chamado em um estado inutilizável', () => {
				resetTime();
				const cooldown = makeCooldown(1000);

				cooldown.useIfAble();
				advanceTime(900);
				expect(cooldown.useIfAble()).toBe(false);
				advanceTime(100);
				expect(cooldown.useIfAble()).toBe(true);
			});

			it('esgota imediatamente, não importa quanto tempo ficou inativo', () => {
				resetTime();
				const cooldown = makeCooldown(1000);

				cooldown.useIfAble();
				advanceTime(50000);
				// Deve ser bastante recarregado
				expect(cooldown.useIfAble()).toBe(true);
				// mas ainda deve descarregar imediatamente
				expect(cooldown.canUse()).toBe(false);
				expect(cooldown.useIfAble()).toBe(false);
				// ainda demora um segundo para recarregar
				advanceTime(1000);
				expect(cooldown.canUse()).toBe(true);
				expect(cooldown.useIfAble()).toBe(true);
			});

			it('resets com reset de tempo de jogo', () => {
				resetTime();
				const cooldown = makeCooldown(1000);

				// Tenta simular o uso semi-realista,
// incluindo um reset do jogo no meio do cooldown.
				cooldown.useIfAble();
				advanceTime(5000);
				cooldown.useIfAble();
				advanceTime(2000);
				cooldown.useIfAble();
				advanceTime(400);
				expect(cooldown.canUse()).toBe(false);
				resetTime();
				advanceTime(100);
				expect(cooldown.canUse()).toBe(true);
				expect(cooldown.useIfAble()).toBe(true);
				advanceTime(400);
				expect(cooldown.canUse()).toBe(false);
			});
		});

		describe('3 unidades' , () => {
			it('pode ser chamado 3 vezes seguidas', () => {
				resetTime();
				const cooldown = makeCooldown(1000, 3);

				expect(cooldown.useIfAble()).toBe(true);
				expect(cooldown.useIfAble()).toBe(true);
				expect(cooldown.useIfAble()).toBe(true);
				expect(cooldown.canUse()).toBe(false);
				expect(cooldown.useIfAble()).toBe(false);
			});

			it('pode ser usado novamente após uma única unidade ser recarregada', () => {
				resetTime();
				const cooldown = makeCooldown(1000, 3);

				cooldown.useIfAble();
				cooldown.useIfAble();
				cooldown.useIfAble();
				expect(cooldown.canUse()).toBe(false);
				advanceTime(500);
				expect(cooldown.canUse()).toBe(false);
				advanceTime(500);
				expect(cooldown.canUse()).toBe(true);
				expect(cooldown.useIfAble()).toBe(true);
				expect(cooldown.canUse()).toBe(false);
			});

			it('pode recarregar todas as unidades', () => {
				resetTime();
				const cooldown = makeCooldown(1000, 3);

				cooldown.useIfAble();
				cooldown.useIfAble();
				cooldown.useIfAble();
				advanceTime(3000);
				expect(cooldown.useIfAble()).toBe(true);
				expect(cooldown.useIfAble()).toBe(true);
				expect(cooldown.useIfAble()).toBe(true);
				expect(cooldown.canUse()).toBe(false);
				// Não "sobrecarrega"
				advanceTime(50000);
				expect(cooldown.useIfAble()).toBe(true);
				expect(cooldown.useIfAble()).toBe(true);
				expect(cooldown.useIfAble()).toBe(true);
				expect(cooldown.canUse()).toBe(false);
			});

			it('redefine todas as unidades com redefinição de tempo de jogo', () => {
				resetTime();
				const cooldown = makeCooldown(1000, 3);

				cooldown.useIfAble();
				cooldown.useIfAble();
				cooldown.useIfAble();
				expect(cooldown.canUse()).toBe(false);
				advanceTime(1500);
				expect(cooldown.canUse()).toBe(true);
				resetTime();
				advanceTime(100);
				expect(cooldown.useIfAble()).toBe(true);
				expect(cooldown.useIfAble()).toBe(true);
				expect(cooldown.useIfAble()).toBe(true);
				expect(cooldown.canUse()).toBe(false);
			});
		});

		describe('mutação de configuração', () => {
			it('pode atualizar a taxa de resfriamento', () => {
				resetTime();
				const cooldown = makeCooldown(1000);

				cooldown.useIfAble();
				advanceTime(500);
				// Deve ser inutilizável após meio segundo...
				expect(cooldown.canUse()).toBe(false);
				// ...a menos que o cooldown seja apenas meio segundo
				cooldown.mutate({ rechargeTime: 500 });
				expect(cooldown.canUse()).toBe(true);
				expect(cooldown.useIfAble()).toBe(true);
				expect(cooldown.canUse()).toBe(false);
				// Daqui em diante, o tempo de recarga ainda deve ser de 500ms.
				advanceTime(250);
				expect(cooldown.canUse()).toBe(false);
				advanceTime(250);
				expect(cooldown.canUse()).toBe(true);
			});

			it('pode atualizar a contagem de unidades', () => {
				resetTime();
				const cooldown = makeCooldown(1000, 2);

				cooldown.useIfAble();
				cooldown.useIfAble();
				// Deve ser inutilizável após dois usos...
				expect(cooldown.canUse()).toBe(false);
				// ...a menos que adicionemos uma terceira unidade
				cooldown.mutate({ units: 3 });
				expect(cooldown.canUse()).toBe(true);
				expect(cooldown.useIfAble()).toBe(true);
				expect(cooldown.canUse()).toBe(false);
				// Deve ser capaz de recarregar todas as unidades
				advanceTime(3000);
				expect(cooldown.useIfAble()).toBe(true);
				expect(cooldown.useIfAble()).toBe(true);
				expect(cooldown.useIfAble()).toBe(true);
				expect(cooldown.useIfAble()).toBe(false);
			});

			it('pode ser redefinido para o estado inicial', () => {
				resetTime();
				const cooldown = makeCooldown(1000, 1);

				// Usa e muda
				cooldown.useIfAble();
				expect(cooldown.canUse()).toBe(false);
				cooldown.mutate({ rechargeTime: 500, units: 2 });
				expect(cooldown.useIfAble()).toBe(true);
				expect(cooldown.canUse()).toBe(false);
				advanceTime(500);
				expect(cooldown.useIfAble()).toBe(true);
				expect(cooldown.canUse()).toBe(false);
				// Redefinir e afirmar as propriedades originais
				cooldown.reset();
				expect(cooldown.useIfAble()).toBe(true);
				expect(cooldown.canUse()).toBe(false);
				advanceTime(500);
				expect(cooldown.canUse()).toBe(false);
				advanceTime(500);
				expect(cooldown.canUse()).toBe(true);
			});

			it('é reiniciado quando todos os cooldowns são reiniciados', () => {
				resetTime();
				const cooldown = makeCooldown(1000, 1);

				// Usa e muda
				cooldown.useIfAble();
				expect(cooldown.canUse()).toBe(false);
				cooldown.mutate({ rechargeTime: 500, units: 2 });
				expect(cooldown.useIfAble()).toBe(true);
				expect(cooldown.canUse()).toBe(false);
				advanceTime(500);
				expect(cooldown.useIfAble()).toBe(true);
				expect(cooldown.canUse()).toBe(false);
				// Redefinir e afirmar as propriedades originais
				resetAllCooldowns();
				expect(cooldown.useIfAble()).toBe(true);
				expect(cooldown.canUse()).toBe(false);
				advanceTime(500);
				expect(cooldown.canUse()).toBe(false);
				advanceTime(500);
				expect(cooldown.canUse()).toBe(true);
			});
		});
	});
});
