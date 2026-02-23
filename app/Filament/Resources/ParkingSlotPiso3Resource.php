<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ParkingSlotPiso3Resource\Pages;
use App\Models\ParkingSlot;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class ParkingSlotPiso3Resource extends Resource
{
    protected static ?string $model = ParkingSlot::class;

    protected static ?string $navigationIcon  = 'heroicon-o-map-pin';
    protected static ?string $navigationLabel = 'Estacionamiento Medioambiente';
    protected static ?string $modelLabel      = 'Cajón';
    protected static ?string $pluralModelLabel= 'Estacionamiento Medioambiente';
    protected static ?int    $navigationSort  = 3;
    protected static ?string $slug            = 'parking-slots-piso3';

    public static function getEloquentQuery(): \Illuminate\Database\Eloquent\Builder
    {
        return parent::getEloquentQuery()->where('piso', 3);
    }

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Hidden::make('piso')->default(3),

            Forms\Components\Section::make('Información del Cajón')
                ->schema([
                    Forms\Components\Select::make('slot_number')
                        ->label('Número de Cajón')
                        ->options([
                            '1'=>'1','2'=>'2','3'=>'3','4'=>'4',
                            '5'=>'5','6'=>'6','7'=>'7','8'=>'8','9'=>'9','10'=>'10',
                        ])
                        ->required()
                        ->rules(function ($record) {
                            return [
                                'required',
                                \Illuminate\Validation\Rule::unique('parking_slots', 'slot_number')
                                    ->where('piso', 3)
                                    ->ignore($record?->id),
                            ];
                        }),

                    Forms\Components\Select::make('estado')
                        ->label('Estado')
                        ->options([
                            'libre'     => 'Libre',
                            'ocupado'   => 'Ocupado',
                            'reservado' => 'Reservado',
                        ])
                        ->required()
                        ->default('libre'),
                ])->columns(2),

            Forms\Components\Section::make('Datos del Ocupante')
                ->schema([
                    Forms\Components\TextInput::make('nombre')
                        ->label('Nombre')
                        ->maxLength(100),

                    Forms\Components\TextInput::make('phone')
                        ->label('Teléfono')
                        ->maxLength(20),

                    Forms\Components\TextInput::make('placa')
                        ->label('Placa')
                        ->maxLength(20),

                    Forms\Components\TextInput::make('modelo')
                        ->label('Modelo del Vehículo')
                        ->maxLength(100),

                    Forms\Components\TextInput::make('notas')
                        ->label('Notas')
                        ->maxLength(200),
                ])->columns(2),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([

                Tables\Columns\TextColumn::make('slot_number')
                    ->label('Cajón')
                    ->sortable()
                    ->searchable()
                    ->badge(),

                Tables\Columns\TextColumn::make('nombre')
                    ->label('Nombre')
                    ->searchable()
                    ->default('—'),
                
                Tables\Columns\TextColumn::make('phone')
                    ->label('Teléfono')
                    ->searchable()
                    ->default('—'),

                Tables\Columns\TextColumn::make('placa')
                    ->label('Placa')
                    ->searchable()
                    ->copyable()
                    ->default('—'),

                Tables\Columns\TextColumn::make('modelo')
                    ->label('Modelo')
                    ->default('—'),

                Tables\Columns\BadgeColumn::make('estado')
                    ->label('Estado')
                    ->colors([
                        'success' => 'libre',
                        'danger'  => 'ocupado',
                        'warning' => 'reservado',
                    ]),

                Tables\Columns\TextColumn::make('updated_at')
                    ->label('Actualizado')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('estado')
                    ->options([
                        'libre'     => 'Libre',
                        'ocupado'   => 'Ocupado',
                        'reservado' => 'Reservado',
                    ]),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListParkingSlotPiso3s::route('/'),
            'create' => Pages\CreateParkingSlotPiso3::route('/create'),
            'edit'   => Pages\EditParkingSlotPiso3::route('/{record}/edit'),
        ];
    }
}
