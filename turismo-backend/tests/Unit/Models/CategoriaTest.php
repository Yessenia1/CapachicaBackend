<?php

namespace Tests\Unit\Models;

use App\Models\Categoria;
use App\Models\Servicio;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class CategoriaTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    #[Test]
    public function puede_crear_categoria_con_datos_validos()
    {
        // Arrange
        $data = [
            'nombre' => $this->faker->word,
            'descripcion' => $this->faker->text,
            'icono_url' => $this->faker->imageUrl()
        ];

        // Act
        $categoria = Categoria::create($data);

        // Assert
        $this->assertInstanceOf(Categoria::class, $categoria);
        $this->assertEquals($data['nombre'], $categoria->nombre);
        $this->assertEquals($data['descripcion'], $categoria->descripcion);
        $this->assertEquals($data['icono_url'], $categoria->icono_url);
        $this->assertDatabaseHas('categorias', $data);
    }

    #[Test]
    public function fillable_permite_campos_correctos()
    {
        // Arrange
        $categoria = new Categoria();
        $data = [
            'nombre' => 'Test Categoria',
            'descripcion' => 'Test descripcion',
            'icono_url' => 'https://example.com/icon.png',
            'campo_no_permitido' => 'no debe ser asignado'
        ];

        // Act
        $categoria->fill($data);

        // Assert
        $this->assertEquals('Test Categoria', $categoria->nombre);
        $this->assertEquals('Test descripcion', $categoria->descripcion);
        $this->assertEquals('https://example.com/icon.png', $categoria->icono_url);
        $this->assertNull($categoria->campo_no_permitido);
    }

    #[Test]
    public function relacion_servicios_funciona_correctamente()
    {
        // Arrange
        $categoria = Categoria::factory()->create();
        $servicios = Servicio::factory()->count(3)->create();
        
        // Asociar servicios a la categoría
        $categoria->servicios()->attach($servicios->pluck('id'));

        // Act
        $serviciosRelacionados = $categoria->servicios;

        // Assert
        $this->assertCount(3, $serviciosRelacionados);
        foreach ($servicios as $servicio) {
            $this->assertTrue(
                $serviciosRelacionados->contains('id', $servicio->id)
            );
        }
    }

    #[Test]
    public function relacion_servicios_incluye_timestamps()
    {
        // Arrange
        $categoria = Categoria::factory()->create();
        $servicio = Servicio::factory()->create();
        
        // Act
        $categoria->servicios()->attach($servicio->id);
        $pivot = $categoria->servicios()->first()->pivot;

        // Assert
        $this->assertNotNull($pivot->created_at);
        $this->assertNotNull($pivot->updated_at);
    }

    #[Test]
    public function puede_asociar_y_desasociar_servicios()
    {
        // Arrange
        $categoria = Categoria::factory()->create();
        $servicio1 = Servicio::factory()->create();
        $servicio2 = Servicio::factory()->create();

        // Act - Asociar servicios
        $categoria->servicios()->attach([$servicio1->id, $servicio2->id]);
        
        // Assert - Verificar asociación
        $this->assertCount(2, $categoria->servicios);
        
        // Act - Desasociar un servicio
        $categoria->servicios()->detach($servicio1->id);
        
        // Assert - Verificar desasociación
        $categoria->refresh();
        $this->assertCount(1, $categoria->servicios);
        $this->assertTrue($categoria->servicios->contains('id', $servicio2->id));
        $this->assertFalse($categoria->servicios->contains('id', $servicio1->id));
    }

    #[Test]
    public function puede_sincronizar_servicios()
    {
        // Arrange
        $categoria = Categoria::factory()->create();
        $servicios = Servicio::factory()->count(3)->create();
        $nuevosServicios = Servicio::factory()->count(2)->create();
        
        // Asociar servicios iniciales
        $categoria->servicios()->attach($servicios->pluck('id'));

        // Act - Sincronizar con nuevos servicios
        $categoria->servicios()->sync($nuevosServicios->pluck('id'));

        // Assert
        $categoria->refresh();
        $this->assertCount(2, $categoria->servicios);
        foreach ($nuevosServicios as $servicio) {
            $this->assertTrue($categoria->servicios->contains('id', $servicio->id));
        }
        foreach ($servicios as $servicio) {
            $this->assertFalse($categoria->servicios->contains('id', $servicio->id));
        }
    }

    #[Test]
    public function tabla_correcta_es_utilizada()
    {
        // Arrange
        $categoria = new Categoria();

        // Act
        $tabla = $categoria->getTable();

        // Assert
        $this->assertEquals('categorias', $tabla);
    }

    #[Test]
    public function primary_key_es_id_por_defecto()
    {
        // Arrange
        $categoria = new Categoria();

        // Act
        $primaryKey = $categoria->getKeyName();

        // Assert
        $this->assertEquals('id', $primaryKey);
    }

    #[Test]
    public function timestamps_estan_habilitados()
    {
        // Arrange
        $categoria = new Categoria();

        // Act
        $timestamps = $categoria->usesTimestamps();

        // Assert
        $this->assertTrue($timestamps);
    }

    #[Test]
    public function puede_actualizar_campos_individuales()
    {
        // Arrange
        $categoria = Categoria::factory()->create([
            'nombre' => 'Nombre Original'
        ]);

        // Act
        $categoria->update(['nombre' => 'Nombre Actualizado']);

        // Assert
        $this->assertEquals('Nombre Actualizado', $categoria->fresh()->nombre);
    }

    #[Test]
    public function puede_eliminar_categoria()
    {
        // Arrange
        $categoria = Categoria::factory()->create();
        $id = $categoria->id;

        // Act
        $result = $categoria->delete();

        // Assert
        $this->assertTrue($result);
        $this->assertDatabaseMissing('categorias', ['id' => $id]);
    }

    #[Test]
    public function eliminar_categoria_elimina_relaciones_con_servicios()
    {
        // Arrange
        $categoria = Categoria::factory()->create();
        $servicios = Servicio::factory()->count(3)->create();
        $categoria->servicios()->attach($servicios->pluck('id'));

        // Act
        $categoria->delete();

        // Assert
        $this->assertDatabaseMissing('categoria_servicio', [
            'categoria_id' => $categoria->id
        ]);
    }

    #[Test]
    public function puede_buscar_categorias_por_nombre()
    {
        // Arrange
        $categoria1 = Categoria::factory()->create(['nombre' => 'Tecnología']);
        $categoria2 = Categoria::factory()->create(['nombre' => 'Salud']);
        $categoria3 = Categoria::factory()->create(['nombre' => 'Educación']);

        // Act
        $resultado = Categoria::where('nombre', 'like', '%Tec%')->get();

        // Assert
        $this->assertCount(1, $resultado);
        $this->assertTrue($resultado->contains('id', $categoria1->id));
    }

    #[Test]
    public function maneja_valores_nulos_correctamente()
    {
        // Arrange & Act
        $categoria = Categoria::factory()->create([
            'nombre' => 'Test',
            'descripcion' => null,
            'icono_url' => null
        ]);

        // Assert
        $this->assertEquals('Test', $categoria->nombre);
        $this->assertNull($categoria->descripcion);
        $this->assertNull($categoria->icono_url);
    }

    #[Test]
    public function created_at_y_updated_at_se_establecen_automaticamente()
    {
        // Arrange & Act
        $categoria = Categoria::factory()->create();

        // Assert
        $this->assertNotNull($categoria->created_at);
        $this->assertNotNull($categoria->updated_at);
        $this->assertInstanceOf(\Illuminate\Support\Carbon::class, $categoria->created_at);
        $this->assertInstanceOf(\Illuminate\Support\Carbon::class, $categoria->updated_at);
    }

    #[Test]
    public function puede_obtener_cantidad_de_servicios_asociados()
    {
        // Arrange
        $categoria = Categoria::factory()->create();
        $servicios = Servicio::factory()->count(5)->create();
        $categoria->servicios()->attach($servicios->pluck('id'));

        // Act
        $cantidadServicios = $categoria->servicios()->count();

        // Assert
        $this->assertEquals(5, $cantidadServicios);
    }

    #[Test]
    public function puede_verificar_si_tiene_servicios_asociados()
    {
        // Arrange
        $categoriaConServicios = Categoria::factory()->create();
        $categoriaSinServicios = Categoria::factory()->create();
        
        $servicio = Servicio::factory()->create();
        $categoriaConServicios->servicios()->attach($servicio->id);

        // Act & Assert
        $this->assertTrue($categoriaConServicios->servicios()->exists());
        $this->assertFalse($categoriaSinServicios->servicios()->exists());
    }

    #[Test]
    public function nombre_es_requerido_para_creacion()
    {
        // Arrange & Act & Assert
        $this->expectException(\Illuminate\Database\QueryException::class);
        
        Categoria::factory()->create([
            'nombre' => null
        ]);
    }

    #[Test]
    public function puede_convertir_a_array()
    {
        // Arrange
        $categoria = Categoria::factory()->create([
            'nombre' => 'Test',
            'descripcion' => 'Test descripcion',
            'icono_url' => 'https://example.com/icon.png'
        ]);

        // Act
        $array = $categoria->toArray();

        // Assert
        $this->assertIsArray($array);
        $this->assertArrayHasKey('id', $array);
        $this->assertArrayHasKey('nombre', $array);
        $this->assertArrayHasKey('descripcion', $array);
        $this->assertArrayHasKey('icono_url', $array);
        $this->assertArrayHasKey('created_at', $array);
        $this->assertArrayHasKey('updated_at', $array);
    }

    #[Test]
    public function puede_convertir_a_json()
    {
        // Arrange
        $categoria = Categoria::factory()->create();

        // Act
        $json = $categoria->toJson();
        $data = json_decode($json, true);

        // Assert
        $this->assertIsString($json);
        $this->assertIsArray($data);
        $this->assertArrayHasKey('id', $data);
        $this->assertArrayHasKey('nombre', $data);
    }
}