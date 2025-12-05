# Plano de Implementação: Importação CSV FIPE

## Status: ✅ IMPLEMENTADO

Sistema completo de importação de dados FIPE para o banco de dados de veículos.

## Visão Geral

Importar 47.101 registros de veículos do arquivo `fipe/tabela-fipe-328.csv` para o schema de banco de dados de veículos usando APIs nativas do Bun, batch inserts do Drizzle ORM e otimizações de processamento em lote.

**⚠️ IMPORTANTE:** Este plano NÃO inclui migrations. O schema do banco de dados já deve estar criado e pronto para receber os dados.

## Pré-requisitos

Antes de executar a importação, certifique-se de que:

1. ✅ O schema do banco de dados está criado (tabelas: `vehicleBrands`, `vehicleModels`, `vehicleYears`, `vehicleDetails`)
2. ✅ O banco de dados está rodando e acessível
3. ✅ As variáveis de ambiente estão configuradas (`DATABASE_URL`)
4. ✅ O arquivo CSV está no caminho correto: `fipe/tabela-fipe-328.csv`
5. ⚠️ **IMPORTANTE**: NÃO usar constraint UNIQUE em `code_fipe` - cada linha do CSV é única (ano/preço diferentes)

## Abordagem Implementada

### Características Principais

✅ **Parsing CSV com Bun**: Uso nativo de `Bun.file()` para leitura rápida
✅ **Batch Insert**: Inserções em lote no PostgreSQL (1000 linhas por lote)
✅ **Transaction Wrapper**: Atomicidade com rollback automático em caso de erro
✅ **Sem Deduplicação**: Cada linha do CSV é inserida como registro único
✅ **Title Case**: Todos os nomes com primeira letra maiúscula
✅ **Direct INSERT**: Sem upsert para vehicle_details (cada registro é único)

### Decisão Crítica: Sem Deduplicação

**Entendimento Final**:
- Cada linha do CSV é ÚNICA (ano/preço/mês diferentes = registro diferente)
- O mesmo `code_fipe` pode aparecer múltiplas vezes com dados diferentes
- NÃO usar constraint UNIQUE em `code_fipe`
- NÃO usar upsert - apenas INSERT direto
- NÃO deduplicar dentro dos lotes

---

## Mapeamento de Dados

### Estrutura CSV → Schema do Banco de Dados

**Colunas do CSV (12):**

```text
Type, Brand Code, Brand Value, Model Code, Model Value,
Year Code, Year Value, Fipe Code, Fuel Letter, Fuel Type, Price, Month
```

**Tabelas Destino:**

1. **vehicleBrands** (code, name)
   - CSV: Brand Code → code
   - CSV: Brand Value → name (Title Case)

2. **vehicleModels** (code, name)
   - CSV: Model Code → code
   - CSV: Model Value → name (Title Case)

3. **vehicleYears** (code, name)
   - CSV: Year Code → code
   - CSV: Year Value → name (Title Case, "32000" → "Zero Km")

4. **vehicleDetails** (id, brand, model, modelYear, vehicleType, fuel, fuelAcronym, codeFipe, price, referenceMonth)
   - CSV: Brand Code → brand
   - CSV: Model Code → model
   - CSV: Year Code → modelYear
   - CSV: Type → vehicleType (Title Case: "Car", "Motorcycle", "Truck")
   - CSV: Fuel Type → fuel (Title Case)
   - CSV: Fuel Letter → fuelAcronym
   - CSV: Fipe Code → codeFipe (SEM constraint UNIQUE)
   - CSV: Price → price (transformação: "R$ 18.857,00" → "18857.00")
   - CSV: Month → referenceMonth (Title Case: "dezembro de 2025" → "Dezembro De 2025")
   - Gerado: id (UUID v7 via `Bun.randomUUIDv7()`)

---

## Arquivos Implementados

### Utilitários

**`src/utils/vehicle-mappers.ts`**
- `toTitleCase(text: string): string` - Converte texto para Title Case
- `validateVehicleType(csvType: string): Result<string>` - Valida tipos de veículo
- `parsePrice(priceStr: string): Result<string>` - Parse de preço brasileiro

**`src/utils/csv-parser.ts`**
- `parseFipeCSV(filePath: string): Promise<Result<CsvRow[]>>` - Parser CSV com Bun

### Serviços

**`src/services/vehicle/fipe-import.service.ts`**
- Classe principal `FipeImportService`
- Processamento em lotes de 1000 registros
- Transaction wrapper para atomicidade
- INSERT direto sem deduplicação para vehicle_details
- Upsert apenas para tabelas de referência (brands, models, years)

**`src/services/vehicle/fipe-import-errors.ts`**
- Erros de domínio customizados

**`src/services/vehicle/fipe-import.types.ts`**
- Interfaces TypeScript

### Scripts

**`src/scripts/import-fipe.ts`**
- Script CLI com colored output (chalk)
- Relatório detalhado de importação

---

## Execução

```bash
# Executar importação com arquivo padrão
bun run import:fipe

# Executar com arquivo customizado
bun src/scripts/import-fipe.ts /caminho/para/arquivo.csv

# Verificar resultados no banco
bun run studio
```

### Exemplo de SQL para Consulta

```sql
-- Consulta completa de veículo
SELECT
    vd.code_fipe,
    vb.name AS marca,
    vm.name AS modelo,
    REPLACE(vy.name, '32000', 'Zero Km') AS ano,
    vd.vehicle_type AS tipo,
    vd.fuel AS combustivel,
    vd.price AS preco,
    vd.reference_month AS mes_referencia
FROM tb_vehicle_details vd
LEFT JOIN tb_vehicle_brands vb ON vd.brand = vb.code
LEFT JOIN tb_vehicle_models vm ON vd.model = vm.code
LEFT JOIN tb_vehicle_years vy ON vd.model_year = vy.code
WHERE vd.code_fipe = '004340-6';
```

---

## Otimizações de Performance

### 1. Processamento em Lote
- Lotes de 1000 linhas
- Reduz uso de memória
- Melhora performance de inserção

### 2. Transaction Wrapper
- Atomicidade garantida
- Rollback automático em caso de erro
- Previne importações parciais

### 3. Deduplicação em Memória (APENAS para tabelas de referência)
- Extrair marcas/modelos/anos únicos antes das operações no banco
- Usar JavaScript `Map` para lookups O(1)
- Reduz queries no banco

### 4. Logging com Progresso
- Output colorido com chalk
- Progresso por lote
- Relatório final detalhado

---

## Critérios de Sucesso

✅ Todos os 47.101 registros importados com sucesso (uma linha do CSV = um registro no banco)
✅ COUNT(*) em tb_vehicle_details deve ser igual ao número de linhas do CSV
✅ Múltiplas entradas com mesmo `codeFipe` são VÁLIDAS (anos/preços diferentes)
✅ Todos os nomes em Title Case (primeira letra maiúscula)
✅ Script CLI executa sem erros
✅ Importação completa em <30 segundos
✅ Código segue padrões existentes (Result, services, logging)

---

## Melhorias Futuras (Opcional)

1. **Job Agendado**: Criar job para importações mensais automatizadas
2. **Modo Dry Run**: Adicionar flag `--dry-run` para validar sem inserir
3. **Barra de Progresso**: Indicador visual de progresso
4. **Importação Incremental**: Suportar importação apenas de registros novos/alterados
5. **API de Exportação**: Endpoint REST para disparar importações remotamente
